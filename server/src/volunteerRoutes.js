import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';

import { q, tx, fail, logAction } from './db.js';
import { validate, volunteerRule } from './validation.js';

const router = express.Router();

const asyncRoute = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getId(req) {
  if (!uuidPattern.test(String(req.params.id))) {
    fail(400, 'Invalid ID.');
  }
  return req.params.id;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: 8 * 1024 * 1024,
    fields: 10
  }
});

// =====================================================
// AUTHENTICATION
// =====================================================

const auth = asyncRoute(async (req, _res, next) => {
  const token = req.headers.authorization
    ?.match(/^Bearer (.+)$/)?.[1];

  if (!token) {
    fail(401, 'Please sign in.');
  }

  let payload;

  try {
    payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    );
  } catch {
    fail(401, 'Session expired or invalid.');
  }

  const { rows } = await q(
    `SELECT id,name,role,is_suspended
     FROM users WHERE id=$1`,
    [payload.sub]
  );

  if (!rows[0] || rows[0].is_suspended) {
    fail(401, 'Account unavailable or suspended.');
  }

  req.user = rows[0];
  next();
});

function organizer(req, _res, next) {
  if (req.user.role !== 'organizer') {
    fail(403, 'Only campaign organizers can review volunteers.');
  }
  next();
}

function isMember(req) {
  return ['donor', 'organizer'].includes(req.user.role);
}

// =====================================================
// HELPERS
// =====================================================

async function notify(client, userId, title, message, link) {
  await client.query(
    `INSERT INTO notifications(
       user_id,kind,title,message,link
     ) VALUES($1,'volunteer',$2,$3,$4)`,
    [userId, title, message, link]
  );
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = n => n * Math.PI / 180;
  const R = 6371000;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) *
    Math.cos(rad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(Math.max(0, 1 - a))
  );
}

function coordinate(value, min, max, label) {
  const number = Number(value);

  if (
    value === undefined ||
    value === null ||
    value === '' ||
    !Number.isFinite(number) ||
    number < min ||
    number > max
  ) {
    fail(422, `Invalid ${label}.`);
  }

  return number;
}

function validatePhoto(file) {
  if (
    !file ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
  ) {
    fail(422, 'Upload a JPG, PNG, or WEBP attendance photo.');
  }

  const b = file.buffer;

  const jpg =
    b.length >= 3 &&
    b[0] === 0xff &&
    b[1] === 0xd8 &&
    b[2] === 0xff;

  const png =
    b.subarray(0, 8).equals(
      Buffer.from('89504e470d0a1a0a', 'hex')
    );

  const webp =
    b.subarray(0, 4).toString() === 'RIFF' &&
    b.subarray(8, 12).toString() === 'WEBP';

  if (
    !(file.mimetype === 'image/jpeg' && jpg) &&
    !(file.mimetype === 'image/png' && png) &&
    !(file.mimetype === 'image/webp' && webp)
  ) {
    fail(422, 'Invalid attendance photo contents.');
  }

  if (!file.size || file.size > 8 * 1024 * 1024) {
    fail(422, 'Photo must not exceed 8 MB.');
  }
}

// Shared fields returned to the frontend.
const columns = `
  v.id,
  v.campaign_id,
  v.user_id,
  v.full_name,
  v.phone,
  v.skills,
  v.address,
  v.reason,
  v.availability,
  v.note,
  v.status,
  v.rejection_reason,
  v.created_at,
  v.reviewed_at,
  v.attendance_status,
  v.attendance_review_reason,
  v.attendance_reviewed_at,
  c.title AS campaign_title,
  c.volunteer_date,
  c.volunteer_slots,
  c.required_attendance_hours,
  c.organizer_id
`;

async function applicationById(client, id, lock = false) {
  const { rows } = await client.query(
    `SELECT ${columns},
            c.latitude AS event_latitude,
            c.longitude AS event_longitude,
            c.needs_volunteers
     FROM volunteers v
     JOIN campaigns c ON c.id=v.campaign_id
     WHERE v.id=$1
     ${lock ? 'FOR UPDATE OF v' : ''}`,
    [id]
  );

  if (!rows[0]) {
    fail(404, 'Volunteer application not found.');
  }

  return rows[0];
}

// Checkpoints must be inside the attendance period.
// For short events, the checkpoint interval scales
// instead of requiring two separate one-hour gaps.
function validMidpoint(checks, start, end) {
  const duration = end - start;

  if (duration <= 0) return false;

  const margin = Math.min(3600000, duration / 3);

  return checks.some(check => {
    if (check.kind !== 'checkpoint') return false;

    const time = new Date(check.recorded_at).getTime();

    return (
      time >= start + margin &&
      time <= end - margin
    );
  });
}

// =====================================================
// APPLY AS VOLUNTEER
// =====================================================

router.post(
  '/campaigns/:id/volunteer',
  auth,
  asyncRoute(async (req, res) => {
    if (!isMember(req)) {
      fail(403, 'Only member accounts can volunteer.');
    }

    const eventId = getId(req);
    const data = validate(volunteerRule, req.body);

    const result = await tx(async client => {
      const { rows } = await client.query(
        `SELECT id,title,organizer_id,type,status,
                needs_volunteers,volunteer_date
         FROM campaigns
         WHERE id=$1
         FOR UPDATE`,
        [eventId]
      );

      const event = rows[0];

      if (
        !event ||
        !['volunteer_event','fundraiser'].includes(event.type) ||
        event.status !== 'approved'
      ) {
        fail(404, 'Approved volunteer event not found.');
      }

      if (!event.needs_volunteers) {
        fail(409, 'This event is not accepting volunteers.');
      }

      if (
        event.volunteer_date &&
        new Date(event.volunteer_date).getTime() <= Date.now()
      ) {
        fail(409, 'This event has already started.');
      }

      if (event.organizer_id === req.user.id) {
        fail(409, 'You cannot volunteer for your own event.');
      }

      const { rows: inserted } = await client.query(
        `INSERT INTO volunteers(
           campaign_id,user_id,full_name,phone,skills,
           availability,note,consent,address,reason,status
         )
         VALUES($1,$2,$3,$4,$5,$6,$7,true,$8,$9,'pending')
         ON CONFLICT DO NOTHING
         RETURNING id,status`,
        [
          eventId,
          req.user.id,
          data.fullName,
          data.phone,
          data.skills,
          data.availability,
          data.note,
          data.address,
          data.reason
        ]
      );

      if (!inserted[0]) {
        fail(409, 'You already applied to this event.');
      }

      await notify(
        client,
        event.organizer_id,
        'New volunteer application',
        `${data.fullName} applied for ${event.title}.`,
        `/organizer/campaigns/${eventId}/volunteers`
      );

      await logAction(
        client,
        req.user.id,
        'volunteer.applied',
        'campaign',
        eventId,
        'Application submitted for campaign organizer review.'
      );

      return inserted[0];
    });

    res.status(201).json(result);
  })
);

// =====================================================
// MY VOLUNTEER APPLICATIONS
// =====================================================

router.get(
  '/me/volunteers',
  auth,
  asyncRoute(async (req, res) => {
    const { rows } = await q(
      `SELECT ${columns}
       FROM volunteers v
       JOIN campaigns c ON c.id=v.campaign_id
       WHERE v.user_id=$1
       ORDER BY v.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  })
);

// =====================================================
// ORGANIZER VOLUNTEER RECORDS
// =====================================================

router.get(
  '/campaigns/:id/volunteers',
  auth,
  asyncRoute(async (req, res) => {
    const id = getId(req);

    const { rows: campaigns } = await q(
      `SELECT organizer_id FROM campaigns WHERE id=$1`,
      [id]
    );

    if (
      req.user.role !== 'organizer' ||
      !campaigns[0] ||
      campaigns[0].organizer_id !== req.user.id
    ) {
      fail(404, 'Event not found.');
    }

    const { rows } = await q(
      `SELECT ${columns}
       FROM volunteers v
       JOIN campaigns c ON c.id=v.campaign_id
       WHERE v.campaign_id=$1
       ORDER BY v.created_at DESC`,
      [id]
    );

    res.json(rows);
  })
);

// Admin may monitor aggregate campaign metrics and audit logs, not private
// volunteer profiles or their GPS/photo evidence. Legacy URL is denied.
router.get('/admin/volunteers', auth, (_req, _res) => {
  fail(403, 'Volunteer records are managed by each campaign organizer.');
});

// =====================================================
// CAMPAIGN OWNER APPROVE / REJECT APPLICATION
// =====================================================

router.patch(
  '/organizer/volunteers/:id',
  auth,
  organizer,
  asyncRoute(async (req, res) => {
    const id = getId(req);
    const action = req.body?.action;
    const reason = String(req.body?.reason || '').trim();

    if (reason.length > 500) fail(422, 'Reason must be 500 characters or fewer.');

    if (!['approve', 'reject'].includes(action)) {
      fail(422, 'Invalid review action.');
    }

    if (
      action === 'approve' &&
      req.body.evidenceChecked !== true
    ) {
      fail(422, 'Confirm that you reviewed this applicant.');
    }

    if (action === 'reject' && reason.length < 5) {
      fail(422, 'Provide a rejection reason of at least 5 characters.');
    }

    await tx(async client => {
      const { rows: found } = await client.query(
        `SELECT campaign_id FROM volunteers WHERE id=$1`,
        [id]
      );

      if (!found[0]) {
        fail(404, 'Application not found.');
      }

      // Lock the event first to prevent overbooking.
      const { rows: events } = await client.query(
        `SELECT id,title,status,organizer_id,
                volunteer_slots,needs_volunteers,volunteer_date
         FROM campaigns
         WHERE id=$1 FOR UPDATE`,
        [found[0].campaign_id]
      );

      const event = events[0];

      if (!event || event.organizer_id !== req.user.id) {
        fail(404, 'Your campaign volunteer application was not found.');
      }

      const application = await applicationById(client, id, true);

      if (application.status !== 'pending') {
        fail(409, 'This application has already been reviewed.');
      }

      if (action === 'approve') {
        if (
          event.status !== 'approved' ||
          !event.needs_volunteers
        ) {
          fail(409, 'This event is not accepting volunteers.');
        }

        if (
          !event.volunteer_date ||
          new Date(event.volunteer_date).getTime() <= Date.now()
        ) {
          fail(409, 'Cannot approve volunteers after the event starts.');
        }

        const { rows: counts } = await client.query(
          `SELECT COUNT(*)::int AS total
           FROM volunteers
           WHERE campaign_id=$1 AND status='approved'`,
          [event.id]
        );

        if (
          !event.volunteer_slots ||
          counts[0].total >= event.volunteer_slots
        ) {
          fail(409, 'All volunteer slots are filled.');
        }
      }

      await client.query(
        `UPDATE volunteers SET
           status=$1,
           rejection_reason=$2,
           reviewed_by=$3,
           reviewed_at=NOW()
         WHERE id=$4`,
        [
          action === 'approve' ? 'approved' : 'rejected',
          action === 'reject' ? reason : null,
          req.user.id,
          id
        ]
      );

      await notify(
        client,
        application.user_id,
        `Volunteer application ${
          action === 'approve' ? 'approved' : 'rejected'
        }`,
        action === 'approve'
          ? `You are approved for ${event.title}.`
          : `Your application was rejected. Reason: ${reason}`,
        `/my/volunteers?application=${id}`
      );

      await logAction(
        client,
        req.user.id,
        `volunteer.${action}`,
        'campaign',
        event.id,
        `${application.full_name}: ${reason || action}`
      );
    });

    res.json({
      id,
      status: action === 'approve' ? 'approved' : 'rejected'
    });
  })
);

// =====================================================
// GPS + PHOTO ATTENDANCE
// =====================================================

router.post(
  '/volunteers/:id/attendance',
  auth,
  upload.single('photo'),
  asyncRoute(async (req, res) => {
    const id = getId(req);
    const kind = String(req.body.kind || '');

    if (!['check_in', 'checkpoint', 'check_out'].includes(kind)) {
      fail(422, 'Invalid attendance action.');
    }

    validatePhoto(req.file);

    const latitude = coordinate(
      req.body.latitude, -90, 90, 'latitude'
    );

    const longitude = coordinate(
      req.body.longitude, -180, 180, 'longitude'
    );

    const accuracy = coordinate(
      req.body.accuracy, 0, 100, 'GPS accuracy'
    );

    const result = await tx(async client => {
      const application = await applicationById(client, id, true);

      if (application.user_id !== req.user.id) {
        fail(403, 'You cannot submit attendance for another user.');
      }

      if (
        application.status !== 'approved' ||
        !application.needs_volunteers
      ) {
        fail(409, 'Approved volunteer status is required.');
      }

      const eventTime = new Date(
        application.volunteer_date
      ).getTime();

      if (!Number.isFinite(eventTime)) {
        fail(409, 'The event schedule is invalid.');
      }

      const now = Date.now();

      if (
        now < eventTime - 3600000 ||
        now > eventTime + 86400000
      ) {
        fail(
          409,
          'Attendance is allowed from 1 hour before the event until 24 hours after its start.'
        );
      }

      if (
        application.event_latitude == null ||
        application.event_longitude == null
      ) {
        fail(409, 'The event has no official map location pin.');
      }

      const distance = distanceMeters(
        latitude,
        longitude,
        Number(application.event_latitude),
        Number(application.event_longitude)
      );

      if (distance > 250) {
        fail(
          409,
          `You are ${Math.round(distance)}m away. Maximum distance: 250m.`
        );
      }

      // Application row lock serializes attendance actions.
      const { rows: checks } = await client.query(
        `SELECT kind,recorded_at
         FROM volunteer_attendance_checks
         WHERE volunteer_id=$1
         ORDER BY recorded_at ASC`,
        [id]
      );

      const checkIn = checks.find(
        check => check.kind === 'check_in'
      );

      const checkedOut = checks.some(
        check => check.kind === 'check_out'
      );

      if (
        checkedOut ||
        ['submitted', 'verified', 'rejected'].includes(
          application.attendance_status
        )
      ) {
        fail(409, 'Attendance is already closed.');
      }

      if (kind === 'check_in' && checkIn) {
        fail(409, 'You have already checked in.');
      }

      if (kind !== 'check_in' && !checkIn) {
        fail(409, 'You must check in first.');
      }

      // Prevent incomplete attendance from being closed.
      if (kind === 'check_out') {
        const start = new Date(checkIn.recorded_at).getTime();
        const durationHours = (now - start) / 3600000;

        const requiredHours = Number(
          application.required_attendance_hours
        );

        if (durationHours < requiredHours) {
          fail(
            409,
            `You need ${requiredHours} attendance hours before check-out. Current: ${durationHours.toFixed(2)} hours.`
          );
        }

        if (!validMidpoint(checks, start, now)) {
          fail(
            409,
            'Submit a valid mid-event GPS/photo checkpoint before checking out.'
          );
        }
      }

      const { rows } = await client.query(
        `INSERT INTO volunteer_attendance_checks(
           volunteer_id,kind,latitude,longitude,
           accuracy_m,distance_m,photo_mime,photo_body
         )
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING
           id,kind,recorded_at,distance_m,accuracy_m`,
        [
          id,
          kind,
          latitude,
          longitude,
          accuracy,
          Math.round(distance),
          req.file.mimetype,
          req.file.buffer
        ]
      );

      if (kind === 'check_in') {
        await client.query(
          `UPDATE volunteers
           SET attendance_status='in_progress'
           WHERE id=$1`,
          [id]
        );
      }

      if (kind === 'check_out') {
        await client.query(
          `UPDATE volunteers
           SET attendance_status='submitted'
           WHERE id=$1`,
          [id]
        );

        await notify(
          client,
          application.organizer_id,
          'Volunteer attendance submitted',
          `${application.full_name} completed check-out. Awaiting organizer verification.`,
          `/organizer/campaigns/${application.campaign_id}/volunteers`
        );

      }

      await logAction(
        client,
        req.user.id,
        `volunteer.${kind}`,
        'campaign',
        application.campaign_id,
        'GPS and private photo evidence recorded.'
      );

      return rows[0];
    });

    res.status(201).json(result);
  })
);

// =====================================================
// ATTENDANCE TIMELINE
// =====================================================

router.get(
  '/volunteers/:id/attendance',
  auth,
  asyncRoute(async (req, res) => {
    const id = getId(req);

    const { rows } = await q(
      `SELECT ${columns}
       FROM volunteers v
       JOIN campaigns c ON c.id=v.campaign_id
       WHERE v.id=$1`,
      [id]
    );

    const application = rows[0];

    if (!application) {
      fail(404, 'Application not found.');
    }

    if (
      application.user_id !== req.user.id &&
      application.organizer_id !== req.user.id
    ) {
      fail(403, 'Attendance information is private.');
    }

    const { rows: checks } = await q(
      `SELECT id,kind,latitude,longitude,
              accuracy_m,distance_m,recorded_at
       FROM volunteer_attendance_checks
       WHERE volunteer_id=$1
       ORDER BY recorded_at ASC`,
      [id]
    );

    res.json({ application, checks });
  })
);

// =====================================================
// PRIVATE ATTENDANCE PHOTO
// =====================================================

router.get(
  '/volunteer-evidence/:id',
  auth,
  asyncRoute(async (req, res) => {
    const id = getId(req);

    const { rows } = await q(
      `SELECT
         e.photo_mime,
         e.photo_body,
         v.user_id,
         c.organizer_id
       FROM volunteer_attendance_checks e
       JOIN volunteers v ON v.id=e.volunteer_id
       JOIN campaigns c ON c.id=v.campaign_id
       WHERE e.id=$1`,
      [id]
    );

    const photo = rows[0];

    if (!photo) {
      fail(404, 'Attendance photo not found.');
    }

    if (
      req.user.id !== photo.user_id &&
      req.user.id !== photo.organizer_id
    ) {
      fail(403, 'This attendance photo is private.');
    }

    res.setHeader('Content-Type', photo.photo_mime);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="attendance-photo"'
    );

    res.send(photo.photo_body);
  })
);

// =====================================================
// CAMPAIGN OWNER FINAL ATTENDANCE REVIEW
// =====================================================

router.patch(
  '/organizer/volunteers/:id/attendance',
  auth,
  organizer,
  asyncRoute(async (req, res) => {
    const id = getId(req);
    const action = req.body?.action;
    const reason = String(req.body?.reason || '').trim();

    if (reason.length > 500) fail(422, 'Reason must be 500 characters or fewer.');

    if (!['verify', 'reject'].includes(action)) {
      fail(422, 'Invalid attendance review action.');
    }

    if (
      action === 'verify' &&
      req.body.evidenceChecked !== true
    ) {
      fail(422, 'Review GPS, timestamps, and photos first.');
    }

    if (action === 'reject' && reason.length < 5) {
      fail(422, 'Provide a rejection reason.');
    }

    await tx(async client => {
      const application = await applicationById(client, id, true);

      if (application.organizer_id !== req.user.id) {
        fail(404, 'This attendance record does not belong to your campaign.');
      }

      if (
        application.status !== 'approved' ||
        application.attendance_status !== 'submitted'
      ) {
        fail(409, 'Attendance is not ready for verification.');
      }

      const { rows: checks } = await client.query(
        `SELECT kind,recorded_at
         FROM volunteer_attendance_checks
         WHERE volunteer_id=$1
         ORDER BY recorded_at ASC`,
        [id]
      );

      if (action === 'verify') {
        const checkIn = checks.find(
          check => check.kind === 'check_in'
        );

        const checkOut = checks.find(
          check => check.kind === 'check_out'
        );

        if (!checkIn || !checkOut) {
          fail(409, 'Check-in and check-out are required.');
        }

        const start = new Date(checkIn.recorded_at).getTime();
        const end = new Date(checkOut.recorded_at).getTime();

        const hours = (end - start) / 3600000;

        if (hours < application.required_attendance_hours) {
          fail(
            409,
            `Attendance recorded: ${hours.toFixed(2)} hours. Required: ${application.required_attendance_hours}.`
          );
        }

        if (!validMidpoint(checks, start, end)) {
          fail(409, 'A valid mid-event checkpoint is required.');
        }
      }

      await client.query(
        `UPDATE volunteers
         SET attendance_status=$1,
             attendance_review_reason=$2,
             attendance_reviewed_by=$3,
             attendance_reviewed_at=NOW()
         WHERE id=$4`,
        [
          action === 'verify' ? 'verified' : 'rejected',
          action === 'reject' ? reason : null,
          req.user.id,
          id
        ]
      );

      await notify(
        client,
        application.user_id,
        'Attendance reviewed',
        action === 'verify'
          ? `Your attendance for ${application.campaign_title} was verified.`
          : `Your attendance was rejected. Reason: ${reason}`,
        `/my/volunteers?application=${id}`
      );

      await logAction(
        client,
        req.user.id,
        `volunteer.attendance.${action}`,
        'campaign',
        application.campaign_id,
        `${application.full_name}: ${reason || action}`
      );
    });

    res.json({
      id,
      attendance_status:
        action === 'verify' ? 'verified' : 'rejected'
    });
  })
);

export default router;