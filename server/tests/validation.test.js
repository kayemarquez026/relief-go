import {test} from 'node:test';
import {strict as assert} from 'node:assert';
const phDate = (offset = 0) => { const d = new Date(Date.now() + offset * 86400000); return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); };
import {phoneRule,nameRule,campaignRule,lettersRule,moneyRule,volunteerRule,expenseRule,donationRule} from '../src/validation.js';
test('PH phone accepts exactly 11 digits starting 09',()=>{assert.equal(phoneRule.safeParse('09123456789').success,true);for(const v of ['0912345678','091234567890','12345678901','09abcdefghi'])assert.equal(phoneRule.safeParse(v).success,false);});
test('names support Filipino letters but not digits',()=>{assert.equal(nameRule.safeParse('María Dela Cruz').success,true);assert.equal(nameRule.safeParse('Juan22').success,false);});
test('money must be positive with 2 decimal places',()=>{assert.equal(moneyRule.safeParse(10.25).success,true);assert.equal(moneyRule.safeParse(0).success,false);assert.equal(moneyRule.safeParse(1.234).success,false);});
test('fundraiser requires budget and payout',()=>{const form={type:'fundraiser',title:'Help People',description:'A'.repeat(45),category:'Health',city:'Manila',beneficiary:'Community',beneficiaryRelation:'The community needs support',contactPhone:'09123456789',goal:1000,budget:[]};assert.equal(campaignRule.safeParse(form).success,false);});
test('event requires detailed volunteer subfields',()=>{const form={type:'volunteer_event',title:'Volunteer Day',description:'A'.repeat(45),category:'Community',city:'Manila',beneficiary:'Families',beneficiaryRelation:'We support local families',contactPhone:'09123456789',volunteerDuties:'',volunteerRequirements:'',volunteerLocation:'',volunteerSlots:0};assert.equal(campaignRule.safeParse(form).success,false);});
test('volunteer consent and availability required',()=>{assert.equal(volunteerRule.safeParse({fullName:'Juan Cruz',phone:'09123456789',address:'Barangay Main Street',reason:'I want to help my community',skills:'Logistics',availability:'Weekend',consent:false}).success,false);});

test('cent amount 0.29 is not rejected by floating-point rounding',()=>{assert.equal(moneyRule.safeParse(0.29).success,true);});
test('GCash payout must be 11 digits starting with 09',()=>{
 const form={type:'fundraiser',title:'Help People',description:'A'.repeat(45),category:'Health',city:'Manila',beneficiary:'Community',beneficiaryRelation:'The community needs support',contactPhone:'09123456789',goal:1000,budget:[{item:'Food packs',estimated:1000}],payoutMethod:'GCash',payoutName:'Juan Cruz',payoutNumber:'12345678901',startDate:phDate(2),deadline:phDate(15)};
 assert.equal(campaignRule.safeParse(form).success,false);
 form.payoutNumber='09123456789';assert.equal(campaignRule.safeParse(form).success,true);
});

test('reject forged strings for boolean consent and money amount',()=>{
 const d={amount:100,method:'GCash',reference:'GCASH123456',senderName:'Juan Cruz',anonymous:'false'};
 assert.equal(donationRule.safeParse(d).success,false);
 for(const amount of [true,'1e5','-2','1.234'])assert.equal(moneyRule.safeParse(amount).success,false);
});
test('expense requires explicit true privacy consent and real dates',()=>{
 const e={amount:50,description:'Food packs bought and distributed',category:'Food',spentAt:'2026-01-31',publicSafe:true};
 assert.equal(expenseRule.safeParse(e).success,true);
 assert.equal(expenseRule.safeParse({...e,publicSafe:'true'}).success,false);
 assert.equal(expenseRule.safeParse({...e,publicSafe:false}).success,false);
 assert.equal(expenseRule.safeParse({...e,spentAt:'2026-02-30'}).success,false);
});


test('campaign title and location reject numbers and symbols',()=>{
 for(const bad of ['Help 123 People','Barangay #Three','Food!'])assert.equal(lettersRule.safeParse(bad).success,false);
 assert.equal(lettersRule.safeParse('Tulong Para Sa Lahat').success,true);
});
test('valid fundraiser must include contact, budget, payout and real situation description',()=>{
 const f={type:'fundraiser',title:'Help Families',description:'An honest account of affected families and how the donations will help our community.',category:'Disaster Relief',city:'Manila',beneficiary:'Families',beneficiaryRelation:'We work directly with the community',contactPhone:'09123456789',goal:1000,budget:[{item:'Food packs',estimated:1000}],payoutMethod:'GCash',payoutName:'Juan Cruz',payoutNumber:'09123456789',startDate:phDate(2),deadline:phDate(15)};
 assert.equal(campaignRule.safeParse(f).success,true);
 assert.equal(campaignRule.safeParse({...f,contactPhone:'0912345678'}).success,false);
 assert.equal(campaignRule.safeParse({...f,title:'Families 2026'}).success,false);
});
test('valid volunteer event with conditional fields',()=>{
 const f={type:'volunteer_event',title:'Community Service',description:'We are collecting volunteers to distribute relief supplies to families affected by recent events.',category:'Community',city:'Manila',beneficiary:'Families',beneficiaryRelation:'We coordinate with local families',contactPhone:'09123456789',volunteerDuties:'Pack and distribute relief items',volunteerRequirements:'Bring gloves and sturdy shoes',volunteerLocation:'City Town Hall',volunteerDate:new Date(Date.now()+86400000).toISOString(),volunteerSlots:20,needsVolunteers:true,volunteerHelpCategory:'Food & Relief Distribution',latitude:14.5995,longitude:120.9842};
 assert.equal(campaignRule.safeParse(f).success,true);
 assert.equal(campaignRule.safeParse({...f,volunteerLocation:'A'}).success,false);
});
test('volunteer needs address, reason, availability and explicit consent',()=>{
 const v={fullName:'Juan Dela Cruz',phone:'09123456789',address:'Barangay Poblacion Taysan',reason:'I care about the community',skills:'Packing and logistics',availability:'Saturday morning',note:'',consent:true};
 assert.equal(volunteerRule.safeParse(v).success,true);
 assert.equal(volunteerRule.safeParse({...v,address:''}).success,false);
 assert.equal(volunteerRule.safeParse({...v,reason:'short'}).success,false);
 assert.equal(volunteerRule.safeParse({...v,consent:'true'}).success,false);
});

test('events can be submitted without recruiting volunteers',()=>{
 const form={type:'volunteer_event',title:'Community Gathering',description:'Our community is organizing a public support and information meeting this month.',category:'Community',city:'Davao City',beneficiary:'Families',beneficiaryRelation:'We coordinate directly with local families',contactPhone:'09123456789',volunteerLocation:'Community Center, Davao City',volunteerDate:new Date(Date.now()+3*86400000).toISOString(),needsVolunteers:false,volunteerSlots:0};
 assert.equal(campaignRule.safeParse(form).success,true);
});

test('campaign address accepts real street and barangay identifiers',()=>{
 const baseline={type:'fundraiser',title:'Help Families',description:'An honest account of affected families and how donations will help the wider community.',category:'Disaster Relief',city:'Manila',beneficiary:'Families',beneficiaryRelation:'We work directly with the community',contactPhone:'09123456789',goal:1000,budget:[{item:'Food packs',estimated:1000}],payoutMethod:'GCash',payoutName:'Juan Cruz',payoutNumber:'09123456789',startDate:phDate(2),deadline:phDate(15)};
 assert.equal(campaignRule.safeParse({...baseline,city:'Purok 3, Brgy. San Jose, Legazpi City'}).success,true);
 assert.equal(campaignRule.safeParse({...baseline,city:'12 Rizal St., Barangay 1'}).success,true);
 assert.equal(campaignRule.safeParse({...baseline,city:''}).success,false);
 assert.equal(campaignRule.safeParse({...baseline,city:'a'.repeat(101)}).success,false);
});

// New fundraisers always need donations; volunteer recruitment is independently optional.
test('fundraiser with optional volunteers passes when requirements are complete', () => {
 const base={type:'fundraiser',title:'Community Assistance',description:'Support families with verified donations and optional on-site help.',category:'Disaster Relief',city:'Manila',beneficiary:'Families',beneficiaryRelation:'We coordinate with affected local households',contactPhone:'09123456789',goal:2500,budget:[{item:'Relief items',estimated:2500}],payoutMethod:'GCash',payoutName:'Juan Cruz',payoutNumber:'09123456789',startDate:phDate(2),deadline:phDate(20)};
 assert.equal(campaignRule.safeParse({...base,needsVolunteers:false}).success,true);
 const volunteer={needsVolunteers:true,volunteerDuties:'Sort and distribute relief supplies',volunteerRequirements:'Attend a briefing and wear protective equipment',volunteerLocation:'Community Hall, Manila',volunteerDate:new Date(Date.now()+5*86400000).toISOString(),volunteerSlots:12,volunteerHelpCategory:'General Assistance'};
 assert.equal(campaignRule.safeParse({...base,...volunteer}).success,true);
 assert.equal(campaignRule.safeParse({...base,...volunteer,volunteerSlots:0}).success,false);
 assert.equal(campaignRule.safeParse({...base,...volunteer,volunteerDate:new Date(Date.now()-3600000).toISOString()}).success,false);
 assert.equal(campaignRule.safeParse({...base,startDate:phDate(-1)}).success,false);
});
