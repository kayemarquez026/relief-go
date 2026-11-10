import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {pool,q,tx,fail,logAction} from './db.js';
import {registerRule,campaignRule,donationRule,expenseRule,updateRule,validate} from './validation.js';
import {normalizePaymentReference,requirePayoutMethod} from './payment.js';
import volunteerRoutes from './volunteerRoutes.js';

if(!process.env.DATABASE_URL||!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32||process.env.JWT_SECRET.startsWith('REPLACE_')){
  throw new Error('Set DATABASE_URL and a strong JWT_SECRET (at least 32 characters) in server environment.');
}
const app=express();
app.disable('x-powered-by');
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(cors({origin:(process.env.CLIENT_ORIGIN||'http://localhost:5173').split(',').map(v=>v.trim())}));
app.use(express.json({limit:'80kb'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:'draft-7',legacyHeaders:false}));
app.use('/api',rateLimit({windowMs:60*1000,limit:240,standardHeaders:'draft-7',legacyHeaders:false}));
app.use('/api',volunteerRoutes);

const asyncRoute = fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const getId = req=>{if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(req.params.id)))fail(400,'Invalid ID.');return req.params.id;};
const text = (v)=>String(v??'').trim();
const escapeLike=(s)=>s.replace(/[\\%_]/g,'\\$&');
const readJson=(v)=>{try{return JSON.parse(v);}catch{return fail(400,'Invalid JSON form data.');}};
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:8*1024*1024,files:7,fields:40},fileFilter:(_req,file,cb)=>{
  const allowed=['image/jpeg','image/png','image/webp','application/pdf'];
  cb(null,allowed.includes(file.mimetype));
}});
const auth=asyncRoute(async(req,_res,next)=>{
  const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if(!token)fail(401,'Please sign in.');
  let payload;try{payload=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']});}catch{fail(401,'Session expired or invalid.');}
  const {rows}=await q('SELECT id,name,email,phone,role,is_suspended FROM users WHERE id=$1',[payload.sub]);
  if(!rows[0]||rows[0].is_suspended)fail(401,'Account unavailable or suspended.');req.user=rows[0];next();
});
const optionalAuth=asyncRoute(async(req,_res,next)=>{
  const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];req.user=null;
  if(token){try{const payload=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']});const {rows}=await q('SELECT id,name,email,phone,role,is_suspended FROM users WHERE id=$1',[payload.sub]);req.user=rows[0]&&!rows[0].is_suspended?rows[0]:null;}catch{}}
  next();
});
const roles=(...allowed)=>(req,_res,next)=>allowed.includes(req.user?.role)?next():fail(403,'You do not have permission.');
const issueToken=user=>jwt.sign({sub:user.id},process.env.JWT_SECRET,{expiresIn:'12h',algorithm:'HS256'});
function chooseFile(file,name,onlyImages=false){
  if(!file)fail(422,`${name} is required (JPG, PNG, WEBP, PDF; max 8MB).`);
  const mime=file.mimetype,bytes=file.buffer||Buffer.alloc(0);
  const sig={
    'image/jpeg':bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff,
    'image/png':bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),
    'image/webp':bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP',
    'application/pdf':bytes.subarray(0,5).toString()==='%PDF-'
  };
  if(!Object.prototype.hasOwnProperty.call(sig,mime)||!sig[mime]||(onlyImages&&mime==='application/pdf'))fail(422,'File contents do not match an allowed JPG, PNG, WEBP or PDF.');
  return file;
}
async function storeFile(client,{file,owner,kind,campaignId=null,donationId=null,expenseId=null}){
  chooseFile(file,kind.replace('_',' '));
  const {rows}=await client.query('INSERT INTO files(owner_id,kind,campaign_id,donation_id,expense_id,filename,mime,size_bytes,body) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',[owner,kind,campaignId,donationId,expenseId,file.originalname.slice(0,200),file.mimetype,file.size,file.buffer]);
  if(kind!=='campaign_cover') await client.query('INSERT INTO proofs(file_id,kind) VALUES($1,$2) ON CONFLICT(file_id) DO NOTHING',[rows[0].id,kind]);
  return rows[0].id;
}
function campaignProjection(){return `SELECT c.id,c.organizer_id,c.type,c.title,c.description,c.category,c.city,c.start_date,c.deadline,c.latitude,c.longitude,c.contact_phone,c.beneficiary,c.beneficiary_relation,c.goal,c.budget,c.payout_method,c.payout_name,c.payout_number,c.volunteer_duties,c.volunteer_requirements,c.volunteer_location,c.volunteer_date,c.volunteer_slots,c.needs_volunteers,c.volunteer_help_category,c.status,c.rejection_reason,c.created_at,u.name AS organizer_name,(SELECT id FROM files WHERE campaign_id=c.id AND kind='campaign_cover' ORDER BY created_at DESC LIMIT 1) AS cover_file_id,(SELECT id FROM files WHERE campaign_id=c.id AND kind='campaign_proof' ORDER BY created_at DESC LIMIT 1) AS eligibility_proof_file_id,(SELECT id FROM files WHERE campaign_id=c.id AND kind='valid_id' ORDER BY created_at DESC LIMIT 1) AS valid_id_file_id,(SELECT id FROM files WHERE campaign_id=c.id AND kind='barangay_clearance' ORDER BY created_at DESC LIMIT 1) AS barangay_clearance_file_id,(SELECT id FROM files WHERE campaign_id=c.id AND kind='situation_photo' ORDER BY created_at DESC LIMIT 1) AS situation_photo_file_id,coalesce((SELECT sum(amount) FROM donations WHERE campaign_id=c.id AND status='verified'),0)::float AS raised,(SELECT count(DISTINCT donor_id)::int FROM donations WHERE campaign_id=c.id AND status='verified') AS verified_donor_count,(SELECT count(*)::int FROM volunteers WHERE campaign_id=c.id AND status='approved') AS volunteer_count FROM campaigns c JOIN users u ON u.id=c.organizer_id`}
function campaignForViewer(c,user){
 if(user?.role==='admin'||user?.id===c.organizer_id)return c;
 const {eligibility_proof_file_id,valid_id_file_id,barangay_clearance_file_id,situation_photo_file_id,contact_phone,...publicDetails}=c;
 return publicDetails;
}
app.get('/api/health',asyncRoute(async(_req,res)=>{await q('SELECT 1');res.json({ok:true,db:'postgresql'});}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {

  const data = validate(registerRule, req.body);

  const email = data.email.trim().toLowerCase();
  const phone = data.phone.trim();

  async function getDuplicateStatus() {

    const { rows } = await q(
      `
      SELECT
        EXISTS (
          SELECT 1
          FROM users
          WHERE LOWER(BTRIM(email)) = $1
        ) AS email_exists,

        EXISTS (
          SELECT 1
          FROM users
          WHERE BTRIM(phone) = $2
        ) AS phone_exists
      `,
      [email, phone]
    );

    return {
      emailExists: rows[0]?.email_exists === true,
      phoneExists: rows[0]?.phone_exists === true
    };
  }

  function rejectIfDuplicate({
    emailExists,
    phoneExists
  }) {

    if (emailExists && phoneExists) {
      fail(
        409,
        'This email and mobile number are already registered. Please sign in or use different credentials.'
      );
    }

    if (emailExists) {
      fail(
        409,
        'This email is already registered. Please sign in or use a different email.'
      );
    }

    if (phoneExists) {
      fail(
        409,
        'This mobile number is already registered. Please sign in or use a different mobile number.'
      );
    }
  }

  rejectIfDuplicate(
    await getDuplicateStatus()
  );

  const hashed = await bcrypt.hash(
    data.password,
    12
  );

  const result = await q(
    `
    INSERT INTO users (
      name,
      email,
      phone,
      password_hash,
      role
    )

    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )

    ON CONFLICT DO NOTHING

    RETURNING
      id,
      name,
      email,
      phone,
      role
    `,
    [
      data.name,
      email,
      phone,
      hashed,
      data.role
    ]
  );

  if (!result.rowCount) {

    rejectIfDuplicate(
      await getDuplicateStatus()
    );

    fail(
      409,
      'Registration conflicts with an existing account.'
    );
  }

  res.status(201).json({
    user: result.rows[0],
    token: issueToken(result.rows[0])
  });

}));
app.post('/api/auth/login',asyncRoute(async(req,res)=>{
  const body=req.body && typeof req.body==='object' && !Array.isArray(req.body) ? req.body : {};
  const email=text(body.email).toLowerCase();
  const password=typeof body.password==='string' ? body.password : '';
  if(!email || !password)fail(422,'Please enter your email and password.');
  const {rows}=await q('SELECT * FROM users WHERE lower(email)=$1',[email]);
  if(!rows[0]||!(await bcrypt.compare(password,rows[0].password_hash)))fail(401,'Invalid email or password.');
  if(rows[0].is_suspended)fail(403,'This account is suspended. Contact an administrator.');
  const {id,name,phone,role}=rows[0];const user={id,name,phone,role,email:rows[0].email};
  res.json({user,token:issueToken(user)});
}));
app.get('/api/me',auth,(req,res)=>res.json(req.user));

app.get('/api/me/notifications',auth,asyncRoute(async(req,res)=>{
 const {rows}=await q('SELECT id,kind,title,message,link,is_read,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[req.user.id]);res.json(rows);
}));
app.patch('/api/me/notifications/:id/read',auth,asyncRoute(async(req,res)=>{
 const {rows}=await q('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2 RETURNING id',[getId(req),req.user.id]);
 if(!rows[0])fail(404,'Notification not found.');res.json({ok:true});
}));
app.patch('/api/me/notifications/read-all',auth,asyncRoute(async(req,res)=>{
 await q('UPDATE notifications SET is_read=true WHERE user_id=$1',[req.user.id]);res.json({ok:true});
}));
app.delete('/api/me/notifications/:id',auth,asyncRoute(async(req,res)=>{
 const {rows}=await q('DELETE FROM notifications WHERE id=$1 AND user_id=$2 RETURNING id',[getId(req),req.user.id]);
 if(!rows[0])fail(404,'Notification not found.');res.json({ok:true});
}));


app.get('/api/campaigns',optionalAuth,asyncRoute(async(req,res)=>{
  const args=[];const where=[];
  if(req.query.status==='rejected'){
    if(!req.user)fail(401,'Sign in to view your rejected campaigns.');
    where.push("c.status='rejected'");
    if(req.user.role!=='admin'){args.push(req.user.id);where.push(`c.organizer_id=$${args.length}`);}
  } else if(req.query.status==='completed') where.push("c.status='closed'");
  else if(req.query.status==='active') where.push("c.status='approved'");
  else where.push("c.status IN ('approved','closed')");
  if(req.query.q){args.push(`%${escapeLike(text(req.query.q).slice(0,100))}%`);where.push(`(c.title ILIKE $${args.length} ESCAPE '\\' OR c.description ILIKE $${args.length} ESCAPE '\\' OR c.beneficiary ILIKE $${args.length} ESCAPE '\\')`);}
  if(['fundraiser','volunteer_event'].includes(req.query.type)){args.push(req.query.type);where.push(`c.type=$${args.length}`);}
  if(req.query.category){args.push(text(req.query.category).slice(0,40));where.push(`c.category=$${args.length}`);}
  if(req.query.city){args.push(`%${escapeLike(text(req.query.city).slice(0,100))}%`);where.push(`c.city ILIKE $${args.length} ESCAPE '\\'`);}
  if(req.query.minGoal!==undefined && req.query.minGoal!==''){const n=Number(req.query.minGoal);if(!Number.isFinite(n)||n<0||n>10000000)fail(422,'Invalid minimum goal.');args.push(n);where.push(`c.goal >= $${args.length}`);}
  if(req.query.maxGoal!==undefined && req.query.maxGoal!==''){const n=Number(req.query.maxGoal);if(!Number.isFinite(n)||n<0||n>10000000)fail(422,'Invalid maximum goal.');args.push(n);where.push(`c.goal <= $${args.length}`);}
  if(req.query.minGoal!==undefined&&req.query.maxGoal!==undefined&&req.query.minGoal!==''&&req.query.maxGoal!==''&&Number(req.query.minGoal)>Number(req.query.maxGoal))fail(422,'Minimum goal cannot exceed maximum goal.');
  const sort={newest:'c.created_at DESC',oldest:'c.created_at ASC',goal:'c.goal DESC',raised:'raised DESC'}[req.query.sort]||'c.created_at DESC';
  const limit=Math.min(Math.max(Number(req.query.limit)||24,1),50), offset=Math.min(Math.max(Number(req.query.offset)||0,0),10000);
  args.push(limit,offset);
  const {rows}=await q(`${campaignProjection()} WHERE ${where.join(' AND ')} ORDER BY ${sort} LIMIT $${args.length-1} OFFSET $${args.length}`,args);
  res.json(rows.map(c=>campaignForViewer(c,req.user)));
}));
app.get('/api/campaigns/:id',optionalAuth,asyncRoute(async(req,res)=>{
  const {rows}=await q(`${campaignProjection()} WHERE c.id=$1`,[getId(req)]);
  const c=rows[0];if(!c)fail(404,'Campaign not found.');
  if(!['approved','closed'].includes(c.status) && req.user?.id!==c.organizer_id && req.user?.role!=='admin')fail(404,'Campaign not found.');
  res.json(campaignForViewer(c,req.user));
}));
app.get('/api/campaigns/:id/transparency',optionalAuth,asyncRoute(async(req,res)=>{
  const id=getId(req);const {rows:cs}=await q('SELECT id,organizer_id,status FROM campaigns WHERE id=$1',[id]);
  if(!cs[0] || (!['approved','closed'].includes(cs[0].status)&&req.user?.id!==cs[0].organizer_id&&req.user?.role!=='admin'))fail(404,'Campaign not found.');
  const {rows:expenses}=await q("SELECT id,amount::float,category,description,spent_at,proof_file_id,impact_file_id,reviewed_at FROM expenses WHERE campaign_id=$1 AND status='verified' AND public_safe=true ORDER BY spent_at DESC",[id]);
  const {rows:updates}=await q('SELECT id,title,message,image_url,created_at FROM campaign_updates WHERE campaign_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC',[id]);
  const {rows:total}=await q("SELECT coalesce(sum(amount),0)::float AS verified_donations,count(DISTINCT donor_id)::int AS verified_count FROM donations WHERE campaign_id=$1 AND status='verified'",[id]);
  const {rows:donors}=await q("SELECT d.id,CASE WHEN d.anonymous THEN 'Anonymous' ELSE u.name END AS donor_name,d.amount::float,d.verified_at FROM donations d JOIN users u ON u.id=d.donor_id WHERE d.campaign_id=$1 AND d.status='verified' ORDER BY d.verified_at DESC LIMIT 10",[id]);
  res.json({expenses,updates,donors,...total[0],verifiedExpenses:expenses.reduce((s,e)=>s+e.amount,0)});
}));
app.post('/api/campaigns',auth,roles('donor','organizer'),upload.fields([{name:'eligibilityProof',maxCount:1},{name:'validId',maxCount:1},{name:'barangayClearance',maxCount:1},{name:'situationPhoto',maxCount:1},{name:'cover',maxCount:1}]),asyncRoute(async(req,res)=>{
  const data=validate(campaignRule,readJson(req.body.data||'{}'));
  if(data.type!=='fundraiser')fail(422,'New campaigns must include fundraising. Volunteer recruitment is optional.');
  const proof=chooseFile(req.files?.eligibilityProof?.[0],'Beneficiary/event proof');
  const validId=chooseFile(req.files?.validId?.[0],'Valid ID');
  const clearance=chooseFile(req.files?.barangayClearance?.[0],'Barangay clearance or legitimacy proof');
  const situation=chooseFile(req.files?.situationPhoto?.[0],'Situation photo',true);
  if(req.files?.cover?.[0])chooseFile(req.files.cover[0],'Campaign cover',true);
  const c=await tx(async client=>{
    const {rows}=await client.query(`INSERT INTO campaigns(organizer_id,type,title,description,category,city,beneficiary,beneficiary_relation,goal,budget,payout_method,payout_name,payout_number,volunteer_duties,volunteer_requirements,volunteer_location,volunteer_date,volunteer_slots,contact_phone,needs_volunteers,volunteer_help_category) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING id`,[
      req.user.id,data.type,data.title,data.description,data.category,data.city,data.beneficiary,data.beneficiaryRelation,data.type==='fundraiser'?data.goal:0,JSON.stringify(data.type==='fundraiser'?data.budget:[]),data.type==='fundraiser'?data.payoutMethod:null,data.type==='fundraiser'?data.payoutName:null,data.type==='fundraiser'?data.payoutNumber:null,data.needsVolunteers?data.volunteerDuties:null,data.needsVolunteers?data.volunteerRequirements:null,(data.type==='volunteer_event'||data.needsVolunteers)?data.volunteerLocation:null,(data.type==='volunteer_event'||data.needsVolunteers)?data.volunteerDate:null,data.needsVolunteers?data.volunteerSlots:null,data.contactPhone,data.needsVolunteers,data.needsVolunteers?data.volunteerHelpCategory:null]);
    const id=rows[0].id;
    await client.query('UPDATE campaigns SET start_date=$1,deadline=$2,latitude=$3,longitude=$4 WHERE id=$5',[data.startDate||null,data.deadline||null,data.latitude??null,data.longitude??null,id]);
    await storeFile(client,{file:proof,owner:req.user.id,kind:'campaign_proof',campaignId:id});
    await storeFile(client,{file:validId,owner:req.user.id,kind:'valid_id',campaignId:id});
    await storeFile(client,{file:clearance,owner:req.user.id,kind:'barangay_clearance',campaignId:id});
    await storeFile(client,{file:situation,owner:req.user.id,kind:'situation_photo',campaignId:id});
    if(req.files?.cover?.[0])await storeFile(client,{file:req.files.cover[0],owner:req.user.id,kind:'campaign_cover',campaignId:id});
    await client.query(`INSERT INTO notifications(user_id,kind,title,message,link)
      SELECT id,'campaign','New campaign for review',$1,$2 FROM users WHERE role='admin' AND is_suspended=false`,
      [`${data.title} needs your approval.`, `/admin/campaigns/${id}/view`]);
    await logAction(client,req.user.id,'campaign.submitted','campaign',id,'Organizer submitted campaign with eligibility proof and requirements for review.');
    return {id,status:'pending'};
  });res.status(201).json(c);
}));
app.patch('/api/campaigns/:id',auth,roles('donor','organizer'),upload.fields([{name:'eligibilityProof',maxCount:1},{name:'validId',maxCount:1},{name:'barangayClearance',maxCount:1},{name:'situationPhoto',maxCount:1},{name:'cover',maxCount:1}]),asyncRoute(async(req,res)=>{
  const id=getId(req),data=validate(campaignRule,readJson(req.body.data||'{}'));
  if(req.files?.eligibilityProof?.[0])chooseFile(req.files.eligibilityProof[0],'Eligibility proof');
  if(req.files?.validId?.[0])chooseFile(req.files.validId[0],'Valid ID');
  if(req.files?.barangayClearance?.[0])chooseFile(req.files.barangayClearance[0],'Barangay clearance');
  if(req.files?.situationPhoto?.[0])chooseFile(req.files.situationPhoto[0],'Situation photo',true);
  if(req.files?.cover?.[0])chooseFile(req.files.cover[0],'Campaign cover',true);
  await tx(async client=>{
    const {rows}=await client.query('SELECT * FROM campaigns WHERE id=$1 FOR UPDATE',[id]);const old=rows[0];
    if(!old||old.organizer_id!==req.user.id)fail(404,'Campaign not found.');
    if(old.status!=='rejected')fail(409,'Only rejected campaigns can be changed and resubmitted.');
    if(old.type!==data.type)fail(422,'The campaign type cannot be changed after initial submission.');
    await client.query(`UPDATE campaigns SET title=$1,description=$2,category=$3,city=$4,beneficiary=$5,beneficiary_relation=$6,
      goal=$7,budget=$8::jsonb,payout_method=$9,payout_name=$10,payout_number=$11,volunteer_duties=$12,
      volunteer_requirements=$13,volunteer_location=$14,volunteer_date=$15,volunteer_slots=$16,
      status='pending',rejection_reason=NULL,reviewed_at=NULL,contact_phone=$18,needs_volunteers=$19,volunteer_help_category=$20 WHERE id=$17`,[
      data.title,data.description,data.category,data.city,data.beneficiary,data.beneficiaryRelation,
      data.type==='fundraiser'?data.goal:0,JSON.stringify(data.type==='fundraiser'?data.budget:[]),
      data.type==='fundraiser'?data.payoutMethod:null,data.type==='fundraiser'?data.payoutName:null,
      data.type==='fundraiser'?data.payoutNumber:null,data.needsVolunteers?data.volunteerDuties:null,
      data.needsVolunteers?data.volunteerRequirements:null,(data.type==='volunteer_event'||data.needsVolunteers)?data.volunteerLocation:null,
      (data.type==='volunteer_event'||data.needsVolunteers)?data.volunteerDate:null,data.needsVolunteers?data.volunteerSlots:null,id,data.contactPhone,data.needsVolunteers,data.needsVolunteers?data.volunteerHelpCategory:null]);
    await client.query('UPDATE campaigns SET start_date=$1,deadline=$2,latitude=$3,longitude=$4 WHERE id=$5',[data.startDate||null,data.deadline||null,data.latitude??null,data.longitude??null,id]);
    if(req.files?.eligibilityProof?.[0])await storeFile(client,{file:req.files.eligibilityProof[0],owner:req.user.id,kind:'campaign_proof',campaignId:id});
    if(req.files?.validId?.[0])await storeFile(client,{file:req.files.validId[0],owner:req.user.id,kind:'valid_id',campaignId:id});
    if(req.files?.barangayClearance?.[0])await storeFile(client,{file:req.files.barangayClearance[0],owner:req.user.id,kind:'barangay_clearance',campaignId:id});
    if(req.files?.situationPhoto?.[0])await storeFile(client,{file:req.files.situationPhoto[0],owner:req.user.id,kind:'situation_photo',campaignId:id});
    if(req.files?.cover?.[0])await storeFile(client,{file:req.files.cover[0],owner:req.user.id,kind:'campaign_cover',campaignId:id});
    const {rows:proofs}=await client.query("SELECT id FROM files WHERE campaign_id=$1 AND kind='campaign_proof' LIMIT 1",[id]);
    if(!proofs.length)fail(422,'Eligibility proof is required.');
    const {rows:requiredFiles}=await client.query("SELECT DISTINCT kind FROM files WHERE campaign_id=$1 AND kind IN ('valid_id','barangay_clearance','situation_photo')",[id]);
    if(requiredFiles.length!==3)fail(422,'Valid ID, barangay clearance, and situation photo must all be submitted.');
    await client.query(`INSERT INTO notifications(user_id,kind,title,message,link)
      SELECT id,'campaign','Campaign resubmitted',$1,$2 FROM users WHERE role='admin' AND is_suspended=false`,
      [`${data.title} was updated and needs review.`, `/admin/campaigns/${id}/view`]);
    await logAction(client,req.user.id,'campaign.resubmitted','campaign',id,'Rejected campaign corrected and resubmitted.');
  });res.json({id,status:'pending'});
}));
app.delete('/api/campaigns/:id',auth,roles('donor','organizer'),asyncRoute(async(req,res)=>{
  const id=getId(req);
  await tx(async client=>{
    const {rows}=await client.query('SELECT id,organizer_id,status FROM campaigns WHERE id=$1 FOR UPDATE',[id]);
    const campaign=rows[0];
    if(!campaign || campaign.organizer_id!==req.user.id)fail(404,'Campaign not found.');
    if(!['pending','rejected'].includes(campaign.status))fail(409,'Only pending or rejected campaigns may be deleted. Active and completed campaigns must be kept for audit and transparency.');
    const checks=await Promise.all([
      client.query('SELECT id FROM donations WHERE campaign_id=$1 LIMIT 1',[id]),
      client.query('SELECT id FROM expenses WHERE campaign_id=$1 LIMIT 1',[id]),
      client.query('SELECT id FROM volunteers WHERE campaign_id=$1 LIMIT 1',[id])
    ]);
    if(checks.some(r=>r.rows.length))fail(409,'This campaign has financial or participation records and cannot be deleted.');
    await client.query('DELETE FROM campaign_updates WHERE campaign_id=$1',[id]);
    await client.query('DELETE FROM proofs WHERE file_id IN (SELECT id FROM files WHERE campaign_id=$1)',[id]);
    await client.query('DELETE FROM files WHERE campaign_id=$1',[id]);
    await client.query('DELETE FROM campaigns WHERE id=$1',[id]);
    await logAction(client,req.user.id,'campaign.deleted','campaign',id,'Organizer removed an unapproved campaign with no financial or participation records.');
  });
  res.json({success:true});
}));
app.get('/api/me/campaigns',auth,roles('donor','organizer'),asyncRoute(async(req,res)=>{
  const {rows}=await q(`${campaignProjection()} WHERE c.organizer_id=$1 ORDER BY c.created_at DESC`,[req.user.id]);res.json(rows);
}));
app.get('/api/me/donations/:id',auth,asyncRoute(async(req,res)=>{
  const {rows}=await q('SELECT d.id,d.campaign_id,c.title AS campaign_title,d.amount::float,d.method,d.reference,d.sender_name,d.anonymous,d.status,d.rejection_reason,d.receipt_file_id,d.verified_at,d.created_at FROM donations d JOIN campaigns c ON c.id=d.campaign_id WHERE d.id=$1 AND d.donor_id=$2',[getId(req),req.user.id]);
  if(!rows[0])fail(404,'Donation not found.');res.json(rows[0]);
}));
app.get('/api/me/donations',auth,asyncRoute(async(req,res)=>{
  const {rows}=await q('SELECT d.id,d.campaign_id,c.title AS campaign_title,d.amount::float,d.method,d.reference,d.sender_name,d.anonymous,d.status,d.rejection_reason,d.receipt_file_id,d.verified_at,d.created_at FROM donations d JOIN campaigns c ON c.id=d.campaign_id WHERE d.donor_id=$1 ORDER BY d.created_at DESC',[req.user.id]);res.json(rows);
}));
app.post('/api/campaigns/:id/donations',auth,roles('donor','organizer'),upload.single('receipt'),asyncRoute(async(req,res)=>{
  const id=getId(req);const data=validate(donationRule,readJson(req.body.data||'{}'));chooseFile(req.file,'Payment proof');
  data.reference=normalizePaymentReference(data.reference);
  if(data.reference.length<5)fail(422,'Transaction reference must contain at least 5 letters/digits.');
  const donation=await tx(async client=>{
    const {rows:cs}=await client.query('SELECT type,status,organizer_id,payout_method,deadline FROM campaigns WHERE id=$1 FOR SHARE',[id]);
    if(!cs[0]||cs[0].status!=='approved'||cs[0].type!=='fundraiser')fail(409,'This campaign cannot receive donations.');
    if(cs[0].organizer_id===req.user.id)fail(409,'You cannot submit a donation to your own campaign.');
    if(cs[0].deadline&&new Date(cs[0].deadline).getTime()<Date.now()-86400000)fail(409,'This campaign deadline has passed.');
    requirePayoutMethod(data.method,cs[0].payout_method);
    const {rows}=await client.query('INSERT INTO donations(campaign_id,donor_id,amount,method,reference,sender_name,anonymous) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,status',[id,req.user.id,data.amount,data.method,data.reference,data.senderName,data.anonymous]);
    const receiptId=await storeFile(client,{file:req.file,owner:req.user.id,kind:'payment_receipt',campaignId:id,donationId:rows[0].id});
    await client.query('UPDATE donations SET receipt_file_id=$1 WHERE id=$2',[receiptId,rows[0].id]);
    await logAction(client,req.user.id,'donation.submitted','donation',rows[0].id,'Donation submitted with private payment receipt; awaiting manual review.');
    return rows[0];
  });res.status(201).json(donation);
}));
app.get('/api/campaigns/:id/donations',auth,roles('donor','organizer','admin'),asyncRoute(async(req,res)=>{
  const id=getId(req);
  const {rows:cs}=await q('SELECT organizer_id FROM campaigns WHERE id=$1',[id]);
  if(!cs[0]||(cs[0].organizer_id!==req.user.id&&req.user.role!=='admin'))fail(404,'Campaign not found.');
  const {rows}=await q('SELECT d.id,d.amount::float,d.method,d.reference,d.sender_name,d.status,d.receipt_file_id,d.created_at FROM donations d WHERE d.campaign_id=$1 ORDER BY d.created_at DESC LIMIT 200',[id]);
  res.json(rows);
}));
app.get('/api/campaigns/:id/expenses',auth,roles('donor','organizer','admin'),asyncRoute(async(req,res)=>{
  const id=getId(req);const {rows:cs}=await q('SELECT organizer_id FROM campaigns WHERE id=$1',[id]);
  if(!cs[0]||(cs[0].organizer_id!==req.user.id&&req.user.role!=='admin'))fail(404,'Campaign not found.');
  const {rows}=await q('SELECT id,campaign_id,amount::float,category,description,spent_at,status,rejection_reason,proof_file_id,impact_file_id,public_safe,created_at FROM expenses WHERE campaign_id=$1 ORDER BY created_at DESC',[id]);res.json(rows);
}));
app.post('/api/campaigns/:id/expenses',auth,roles('donor','organizer'),upload.fields([{name:'proof',maxCount:1},{name:'impactProof',maxCount:1}]),asyncRoute(async(req,res)=>{
  const id=getId(req);const data=validate(expenseRule,readJson(req.body.data||'{}'));
  chooseFile(req.files?.proof?.[0],'Receipt or invoice');chooseFile(req.files?.impactProof?.[0],'Proof of actual distribution or use');
  if(req.files.proof[0].buffer.equals(req.files.impactProof[0].buffer))fail(422,'Purchase receipt and actual-use evidence must be DIFFERENT files.');
  if(!data.publicSafe)fail(422,'Remove private details from the receipt, then confirm it is safe for public viewing.');
  const item=await tx(async client=>{
    const {rows:cs}=await client.query('SELECT organizer_id,status,type FROM campaigns WHERE id=$1 FOR SHARE',[id]);
    if(!cs[0]||cs[0].organizer_id!==req.user.id)fail(404,'Campaign not found.');
    if(!['approved','closed'].includes(cs[0].status)||cs[0].type!=='fundraiser')fail(409,'Expenses require an approved fundraiser.');
    const {rows}=await client.query('INSERT INTO expenses(campaign_id,organizer_id,amount,category,description,spent_at,public_safe) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,status',[id,req.user.id,data.amount,data.category,data.description,data.spentAt,true]);
    const fid=await storeFile(client,{file:req.files.proof[0],owner:req.user.id,kind:'expense_proof',campaignId:id,expenseId:rows[0].id});
    const impactId=await storeFile(client,{file:req.files.impactProof[0],owner:req.user.id,kind:'impact_proof',campaignId:id,expenseId:rows[0].id});
    await client.query('UPDATE expenses SET proof_file_id=$1,impact_file_id=$2 WHERE id=$3',[fid,impactId,rows[0].id]);
    await logAction(client,req.user.id,'expense.submitted','expense',rows[0].id,'Expense submitted with payment receipt AND proof of actual use for organizer verification.');return rows[0];
  });res.status(201).json(item);
}));
app.patch('/api/expenses/:id',auth,roles('donor','organizer'),upload.fields([{name:'proof',maxCount:1},{name:'impactProof',maxCount:1}]),asyncRoute(async(req,res)=>{
  const id=getId(req);const data=validate(expenseRule,readJson(req.body.data||'{}'));
  if(!data.publicSafe)fail(422,'Confirm that all supporting documents are safe to make public.');
  await tx(async client=>{
    const {rows}=await client.query('SELECT e.*,c.status AS campaign_status FROM expenses e JOIN campaigns c ON c.id=e.campaign_id WHERE e.id=$1 FOR UPDATE OF e',[id]);
    if(!rows[0]||rows[0].organizer_id!==req.user.id)fail(404,'Expense not found.');
    if(!['pending','rejected'].includes(rows[0].status))fail(409,'Verified expenses cannot be edited.');
    if(!['approved','closed'].includes(rows[0].campaign_status))fail(409,'Campaign is not eligible for expense edits.');
    let fid=rows[0].proof_file_id,impactId=rows[0].impact_file_id;
    if(req.files?.proof?.[0])fid=await storeFile(client,{file:req.files.proof[0],owner:req.user.id,kind:'expense_proof',campaignId:rows[0].campaign_id,expenseId:id});
    if(req.files?.impactProof?.[0])impactId=await storeFile(client,{file:req.files.impactProof[0],owner:req.user.id,kind:'impact_proof',campaignId:rows[0].campaign_id,expenseId:id});
    if(!fid || !impactId)fail(422,'Both purchase receipt and actual-use evidence are required.');
    const {rows:evidenceFiles}=await client.query('SELECT id,body FROM files WHERE id=ANY($1::uuid[])',[fid,impactId]);
    if(evidenceFiles.length!==2||evidenceFiles[0].body.equals(evidenceFiles[1].body))fail(422,'Purchase receipt and actual-use evidence must be two different files.');
    await client.query("UPDATE expenses SET amount=$1,category=$2,description=$3,spent_at=$4,public_safe=true,proof_file_id=$5,impact_file_id=$6,status='pending',rejection_reason=NULL,reviewed_at=NULL WHERE id=$7",[data.amount,data.category,data.description,data.spentAt,fid,impactId,id]);
    await logAction(client,req.user.id,'expense.resubmitted','expense',id,'Edited expense resubmitted for verification.');
  });res.json({id,status:'pending'});
}));
app.post('/api/campaigns/:id/updates',auth,roles('donor','organizer'),asyncRoute(async(req,res)=>{
  const id=getId(req);const data=validate(updateRule,req.body);
  const {rows:cs}=await q('SELECT organizer_id,status FROM campaigns WHERE id=$1',[id]);
  if(!cs[0]||cs[0].organizer_id!==req.user.id)fail(404,'Campaign not found.');
  if(cs[0].status!=='approved')fail(409,'Only approved campaigns can publish updates.');
  const {rows}=await q('INSERT INTO campaign_updates(campaign_id,author_id,title,message,image_url) VALUES($1,$2,$3,$4,$5) RETURNING id',[id,req.user.id,data.title,data.message,data.imageUrl||null]);
  await tx(client=>logAction(client,req.user.id,'update.posted','update',rows[0].id,'Campaign progress update published.'));
  res.status(201).json(rows[0]);
}));
app.delete('/api/updates/:id',auth,roles('donor','organizer'),asyncRoute(async(req,res)=>{
  const id=getId(req);
  await tx(async client=>{
    const {rows}=await client.query('SELECT u.id,c.organizer_id FROM campaign_updates u JOIN campaigns c ON c.id=u.campaign_id WHERE u.id=$1 AND u.deleted_at IS NULL FOR UPDATE OF u',[id]);
    if(!rows[0]||rows[0].organizer_id!==req.user.id)fail(404,'Update not found.');
    await client.query('UPDATE campaign_updates SET deleted_at=now() WHERE id=$1',[id]);
    await logAction(client,req.user.id,'update.deleted','update',id,'Campaign update removed from public view.');
  });res.json({ok:true});
}));
app.get('/api/files/:id',optionalAuth,asyncRoute(async(req,res)=>{
  const id=getId(req);const {rows}=await q('SELECT id,owner_id,campaign_id,donation_id,expense_id,kind,filename,mime,body FROM files WHERE id=$1',[id]);const f=rows[0];if(!f)fail(404,'File not found.');
  let allowed=f.kind==='campaign_cover';
  if(f.kind==='campaign_cover'){const {rows:cs}=await q('SELECT organizer_id,status FROM campaigns WHERE id=$1',[f.campaign_id]);allowed=['approved','closed'].includes(cs[0]?.status)||req.user?.id===cs[0]?.organizer_id||req.user?.role==='admin';}
  if(['expense_proof','impact_proof'].includes(f.kind)){
    const {rows:es}=await q('SELECT e.proof_file_id,e.impact_file_id,e.status,e.public_safe,c.status AS campaign_status,c.organizer_id FROM expenses e JOIN campaigns c ON c.id=e.campaign_id WHERE e.id=$1',[f.expense_id]);
    allowed=!!es[0]&&(
      req.user?.role==='admin'||req.user?.id===es[0].organizer_id||
      ((es[0].proof_file_id===id||es[0].impact_file_id===id)&&es[0].status==='verified'&&es[0].public_safe&&['approved','closed'].includes(es[0].campaign_status))
    );
  }
  if(f.kind==='payment_receipt'){const {rows:ds}=await q('SELECT d.donor_id,c.organizer_id FROM donations d JOIN campaigns c ON c.id=d.campaign_id WHERE d.id=$1',[f.donation_id]);allowed=req.user?.role==='admin'||req.user?.id===ds[0]?.donor_id||req.user?.id===ds[0]?.organizer_id;}
  if(['campaign_proof','valid_id','barangay_clearance','situation_photo'].includes(f.kind)){const {rows:cs}=await q('SELECT organizer_id FROM campaigns WHERE id=$1',[f.campaign_id]);allowed=req.user?.role==='admin'||req.user?.id===cs[0]?.organizer_id;}
  if(allowed&&['expense_proof','impact_proof'].includes(f.kind)&&req.user?.role!=='admin'&&req.user?.id!==f.owner_id){const {rows:ps}=await q('SELECT approved_for_public FROM proofs WHERE file_id=$1',[id]);allowed=ps[0]?.approved_for_public===true;}
  if(!allowed)fail(403,'File is private.');
  res.setHeader('Content-Type',f.mime);res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Disposition',`${f.kind==='campaign_cover'?'inline':'attachment'}; filename="${f.kind.replace(/[^a-z_]/g,'_')}.${f.mime==='application/pdf'?'pdf':f.mime.split('/')[1]}"`);
  res.send(f.body);
}));

app.get('/api/admin/overview',auth,roles('admin'),asyncRoute(async(_req,res)=>{
  const {rows}=await q(`SELECT (SELECT count(*)::int FROM campaigns WHERE status='pending') AS campaigns,
    (SELECT count(*)::int FROM donations WHERE status='pending') AS donations,
    (SELECT count(*)::int FROM expenses WHERE status='pending') AS expenses,
    (SELECT count(*)::int FROM volunteers WHERE status='pending') AS volunteers`);res.json(rows[0]);
}));
app.get('/api/admin/campaigns',auth,roles('admin'),asyncRoute(async(_req,res)=>{
  const {rows}=await q(`${campaignProjection()} ORDER BY CASE c.status WHEN 'pending' THEN 0 ELSE 1 END,c.created_at DESC LIMIT 200`);res.json(rows);
}));
app.get('/api/admin/donations',auth,roles('admin'),asyncRoute(async(_req,res)=>{
  const {rows}=await q('SELECT d.id,d.campaign_id,d.amount::float,d.method,d.reference,d.sender_name,d.receipt_file_id,d.status,d.rejection_reason,d.created_at,c.title AS campaign_title,u.name AS donor_name FROM donations d JOIN campaigns c ON c.id=d.campaign_id JOIN users u ON u.id=d.donor_id ORDER BY CASE d.status WHEN \'pending\' THEN 0 ELSE 1 END,d.created_at DESC LIMIT 200');res.json(rows);
}));
app.get('/api/admin/expenses',auth,roles('admin'),asyncRoute(async(_req,res)=>{
  const {rows}=await q('SELECT e.id,e.campaign_id,e.amount::float,e.category,e.description,e.spent_at,e.status,e.public_safe,e.proof_file_id,e.impact_file_id,e.rejection_reason,c.title AS campaign_title,u.name AS organizer_name FROM expenses e JOIN campaigns c ON c.id=e.campaign_id JOIN users u ON u.id=e.organizer_id ORDER BY CASE e.status WHEN \'pending\' THEN 0 ELSE 1 END,e.created_at DESC LIMIT 200');res.json(rows);
}));
app.get('/api/admin/users',auth,roles('admin'),asyncRoute(async(_req,res)=>{const {rows}=await q('SELECT id,name,email,phone,role,is_suspended,created_at FROM users ORDER BY created_at DESC LIMIT 200');res.json(rows);}));
app.patch('/api/admin/users/:id/suspension',auth,roles('admin'),asyncRoute(async(req,res)=>{
  const id=getId(req);
  if(typeof req.body.suspended!=='boolean')fail(422,'suspended must be a boolean.');
  const suspended=req.body.suspended;
  const reason=text(req.body.reason);
  if(suspended&&reason.length<5)fail(422,'Provide a reason of at least 5 characters.');
  if(id===req.user.id)fail(409,'You cannot suspend your own administrator account.');
  await tx(async client=>{
    const {rows}=await client.query('SELECT id,role,is_suspended,name FROM users WHERE id=$1 FOR UPDATE',[id]);
    const target=rows[0];if(!target)fail(404,'Account not found.');
    if(target.role==='admin')fail(403,'Administrator accounts cannot be suspended here.');
    if(target.is_suspended===suspended)fail(409,'Account already has this status.');
    await client.query('UPDATE users SET is_suspended=$1 WHERE id=$2',[suspended,id]);
    await client.query('INSERT INTO notifications(user_id,kind,title,message,link) VALUES($1,$2,$3,$4,$5)',[
      id,'user',suspended?'Account suspended':'Account reactivated',
      suspended?`Your account was suspended by an administrator. Reason: ${reason}`:'Your account has been reactivated. You can sign in again.','/my']);
    await logAction(client,req.user.id,suspended?'user.suspended':'user.reactivated','user',id,`${target.name}: ${reason||'Reactivated by administrator'}`);
  });res.json({id,is_suspended:suspended});
}));
app.get('/api/admin/reports',auth,roles('admin'),asyncRoute(async(req,res)=>{
 const type=String(req.query.type||'campaigns');
 if(!['campaigns','donations','expenses'].includes(type))fail(422,'Invalid report type.');
 const statements={
   campaigns:`SELECT c.id,c.title,c.category,c.city,c.type,c.status,c.goal::float,c.created_at,u.name AS organizer,
       coalesce((SELECT sum(d.amount) FROM donations d WHERE d.campaign_id=c.id AND d.status='verified'),0)::float AS raised
     FROM campaigns c JOIN users u ON u.id=c.organizer_id ORDER BY c.created_at DESC LIMIT 1000`,
   donations:`SELECT d.id,d.created_at,d.status,d.amount::float,d.method,d.reference,c.title AS campaign,u.name AS donor
     FROM donations d JOIN campaigns c ON c.id=d.campaign_id JOIN users u ON u.id=d.donor_id ORDER BY d.created_at DESC LIMIT 1000`,
   expenses:`SELECT e.id,e.spent_at,e.status,e.amount::float,e.category,e.description,c.title AS campaign,u.name AS organizer
     FROM expenses e JOIN campaigns c ON c.id=e.campaign_id JOIN users u ON u.id=e.organizer_id ORDER BY e.spent_at DESC LIMIT 1000`
 };
 const {rows}=await q(statements[type]);res.json(rows);
}));
app.get('/api/admin/audit',auth,roles('admin'),asyncRoute(async(req,res)=>{
  const clauses=[];const args=[];if(req.query.type&&['campaign','donation','expense','update','user'].includes(req.query.type)){args.push(req.query.type);clauses.push(`a.target_type=$${args.length}`);}
  if(req.query.q){args.push(`%${escapeLike(text(req.query.q).slice(0,100))}%`);clauses.push(`(a.action ILIKE $${args.length} ESCAPE '\\' OR a.details ILIKE $${args.length} ESCAPE '\\' OR u.name ILIKE $${args.length} ESCAPE '\\')`);}
  const {rows}=await q(`SELECT a.id,a.actor_id,coalesce(u.name,'System') AS admin_name,a.action,a.target_type,a.target_id,a.details,a.created_at FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_id ${clauses.length?'WHERE '+clauses.join(' AND '):''} ORDER BY a.created_at DESC LIMIT 200`,args);res.json(rows);
}));
async function review(req,res,kind){
  const id=getId(req),action=req.body.action;
  if(!['verify','approve','reject'].includes(action))fail(422,'Invalid review action.');
  const accepted=kind==='campaign'?'approve':'verify';if(![accepted,'reject'].includes(action))fail(422,'Invalid review action.');
  if(action===accepted && req.body.evidenceChecked!==true)fail(422,'Confirm that you manually inspected and matched the supporting evidence.');
  const reason=text(req.body.reason);if(action==='reject'&&reason.length<5)fail(422,'Please explain the rejection (at least 5 characters).');
  const table=kind==='campaign'?'campaigns':kind==='donation'?'donations':'expenses';
  await tx(async client=>{
    const {rows}=await client.query(`SELECT * FROM ${table} WHERE id=$1 FOR UPDATE`,[id]);const item=rows[0];if(!item)fail(404,'Record not found.');
    if(item.status!=='pending')fail(409,'Only pending records can be reviewed.');
    if(kind==='campaign'){
      if(req.user.role!=='admin')fail(403,'Only administrators can approve campaigns.');
    } else {
      const {rows:owners}=await client.query('SELECT organizer_id FROM campaigns WHERE id=$1',[item.campaign_id]);
      if(req.user.role==='admin'||!owners[0]||owners[0].organizer_id!==req.user.id)
        fail(403,'Only the organizer of this campaign may review its donations and expenses.');
    }
    if(kind==='campaign'){
      const {rows:files}=await client.query("SELECT id FROM files WHERE campaign_id=$1 AND kind='campaign_proof' LIMIT 1",[id]);
      if(!files.length)fail(409,'Missing campaign eligibility proof.');
      const {rows:checks}=await client.query("SELECT DISTINCT kind FROM files WHERE campaign_id=$1 AND kind IN ('valid_id','barangay_clearance','situation_photo')",[id]);
      if(checks.length!==3 || !item.contact_phone)fail(409,'Campaign requires valid ID, barangay clearance, situation photo, and contact number before approval.');
      await client.query('UPDATE campaigns SET status=$1,rejection_reason=$2,reviewed_at=now() WHERE id=$3',[action==='approve'?'approved':'rejected',action==='reject'?reason:null,id]);
    } else if(kind==='donation'){
      if(!item.receipt_file_id)fail(409,'Cannot verify donation without receipt.');
      await client.query('UPDATE donations SET status=$1,rejection_reason=$2,verified_at=$3 WHERE id=$4',[action==='verify'?'verified':'rejected',action==='reject'?reason:null,action==='verify'?new Date():null,id]);
    }else{
      if(!item.proof_file_id || !item.impact_file_id || !item.public_safe)fail(409,'Cannot verify expense without both receipt and actual-use evidence approved for public review.');
      const {rows:proofs}=await client.query('SELECT body FROM files WHERE id=ANY($1::uuid[])',[item.proof_file_id,item.impact_file_id]);
      if(proofs.length!==2||proofs[0].body.equals(proofs[1].body))fail(409,'The receipt and impact evidence must be different files.');
      if(action==='verify'){
        await client.query('SELECT id FROM campaigns WHERE id=$1 FOR UPDATE',[item.campaign_id]);
        const {rows:balances}=await client.query(`SELECT
         coalesce((SELECT sum(amount) FROM donations WHERE campaign_id=$1 AND status='verified'),0)::numeric AS received,
         coalesce((SELECT sum(amount) FROM expenses WHERE campaign_id=$1 AND status='verified' AND id<>$2),0)::numeric AS already_spent`,[item.campaign_id,id]);
        if(Number(balances[0].already_spent)+Number(item.amount)>Number(balances[0].received)+0.00001)
          fail(409,'Verified expense total cannot exceed verified donations. Review the available funds first.');
      }
      await client.query('UPDATE expenses SET status=$1,rejection_reason=$2,reviewed_at=now() WHERE id=$3',[action==='verify'?'verified':'rejected',action==='reject'?reason:null,id]);
      if(action==='verify')await client.query('UPDATE proofs SET approved_for_public=true,reviewed_by=$1,reviewed_at=now() WHERE file_id=ANY($2::uuid[])',[req.user.id,[item.proof_file_id,item.impact_file_id]]);
    }
    const recipient=kind==='campaign'?item.organizer_id:kind==='donation'?item.donor_id:item.organizer_id;
    const done=action!=='reject';
    const subject=kind==='campaign'?'Campaign':kind==='donation'?'Donation':'Expense';
    const link=kind==='campaign'?`/organizer/campaigns/${id}/manage`:kind==='donation'?`/donor/donations/${id}`:`/organizer/campaigns/${item.campaign_id}/expenses?expense=${id}`;
    await client.query('INSERT INTO notifications(user_id,kind,title,message,link) VALUES($1,$2,$3,$4,$5)',[
      recipient,kind,`${subject} ${done?(kind==='campaign'?'approved':'verified'):'rejected'}`,
      done?`Your ${kind} was reviewed and approved.`:`Your ${kind} was rejected. Reason: ${reason}`,link]);
    await logAction(client,req.user.id,`${kind}.${action==='approve'||action==='verify'?'verified':'rejected'}`,kind,id,action==='reject'?`Rejected: ${reason}`:`${kind==='campaign'?'Administrator':'Campaign organizer'} reviewed evidence and ${action==='approve'?'approved':'verified'} ${kind}.`);
  });res.json({id,status:action==='reject'?'rejected':kind==='campaign'?'approved':'verified'});
}
app.patch('/api/admin/campaigns/:id/status',auth,roles('admin'),asyncRoute(async(req,res)=>{
  const id=getId(req),status=req.body.status;
  if(!['approved','closed'].includes(status))fail(422,'Status must be approved or closed.');
  await tx(async client=>{
    const {rows}=await client.query('SELECT status,organizer_id,type,title FROM campaigns WHERE id=$1 FOR UPDATE',[id]);
    if(!rows[0]||!['approved','closed'].includes(rows[0].status))fail(409,'Only approved/completed campaigns may be switched.');
    await client.query('UPDATE campaigns SET status=$1 WHERE id=$2',[status,id]);
    await logAction(client,req.user.id,`campaign.${status}`,'campaign',id,`Admin set campaign status to ${status}.`);
    if(rows[0].status!==status){
      await client.query('INSERT INTO notifications(user_id,kind,title,message,link) VALUES($1,$2,$3,$4,$5)',[
        rows[0].organizer_id,'campaign',status==='closed'?'Event/campaign completed':'Event/campaign reopened',
        `${rows[0].title} has been ${status==='closed'?'marked completed':'reopened'} by an administrator.`,
        `/organizer/campaigns/${id}/manage`]);
    }
  });res.json({id,status});
}));
app.patch('/api/admin/campaigns/:id',auth,roles('admin'),asyncRoute((req,res)=>review(req,res,'campaign')));
app.patch('/api/campaigns/:campaignId/donations/:id/review',auth,roles('donor','organizer'),asyncRoute(async(req,res)=>{
  const {rows}=await q('SELECT campaign_id FROM donations WHERE id=$1',[getId(req)]);
  if(!rows[0]||rows[0].campaign_id!==req.params.campaignId)fail(404,'Donation not found in this campaign.');
  return review(req,res,'donation');
}));
app.patch('/api/admin/donations/:id',auth,roles('admin'),asyncRoute((req,res)=>review(req,res,'donation')));
app.patch('/api/campaigns/:campaignId/expenses/:id/review',auth,roles('donor','organizer'),asyncRoute(async(req,res)=>{
  const {rows}=await q('SELECT campaign_id FROM expenses WHERE id=$1',[getId(req)]);
  if(!rows[0]||rows[0].campaign_id!==req.params.campaignId)fail(404,'Expense not found in this campaign.');
  return review(req,res,'expense');
}));
app.patch('/api/admin/expenses/:id',auth,roles('admin'),asyncRoute((req,res)=>review(req,res,'expense')));
app.use((err,req,res,_next)=>{
  console.error('[ReliefGO API]',req.method,req.originalUrl,'code:',err?.code||'-','message:',err?.message||'Unknown error');
  if(err?.type==='entity.parse.failed')return res.status(400).json({error:'Invalid request data. Please check the form and try again.'});
  if(err instanceof multer.MulterError)return res.status(422).json({error:err.code==='LIMIT_FILE_SIZE'?'Maximum upload size is 8 MB.':err.message});
  const databaseErrors={
    '23505':[409,'That record already exists.'],
    '22P02':[400,'Invalid identifier or input format.'],
    '42703':[503,'Database column is missing; check database migrations.'],
    '42P01':[503,'Database table is missing; check database migrations.'],
    '23514':[422,'The submitted data violates a database rule.'],
    '23502':[422,'A required field is missing in the database record.'],
    '22001':[422,'One or more fields exceed the permitted length.']
  };
  if(databaseErrors[err?.code]){
    const [status,error]=databaseErrors[err.code];
    console.error('PostgreSQL constraint:',err.constraint||'-','detail:',err.detail||'-');
    return res.status(status).json({error});
  }
  if(Number.isInteger(err?.status)&&err.status>=400&&err.status<500)return res.status(err.status).json({error:err.message});
  console.error('Unexpected API error:',err);
  return res.status(500).json({error:'An unexpected server error occurred.'});
});
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log(`ReliefGO API running on http://localhost:${port}`));
process.on('SIGTERM',async()=>{await pool.end();process.exit(0);});