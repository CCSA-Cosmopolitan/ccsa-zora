const errors=[];
const get=name=>process.env[name]?.trim()||'';
for(const name of ['DATABASE_URL','OPENAI_API_KEY','FIMS_API_URL','ZORA_PUBLIC_URL','ZORA_FIMS_SHARED_SECRET'])if(!get(name))errors.push(name+' is required');
if(get('ZORA_FIMS_SHARED_SECRET').length<32)errors.push('ZORA_FIMS_SHARED_SECRET must contain at least 32 characters');
for(const key of ['FIMS_API_URL','ZORA_PUBLIC_URL']){try{const url=new URL(get(key));if(url.protocol!=='https:'||['localhost','127.0.0.1'].includes(url.hostname))errors.push(key+' must be a public HTTPS origin');}catch{errors.push(key+' is invalid');}}
try{const db=new URL(get('DATABASE_URL'));if(!['postgres:','postgresql:'].includes(db.protocol)||!db.hostname.endsWith('.neon.tech')||db.searchParams.get('sslmode')!=='require'||decodeURIComponent(db.username)!=='zora_runtime_app')errors.push('DATABASE_URL must use the restricted zora_runtime_app Neon role and SSL');}catch{errors.push('DATABASE_URL is invalid');}
if(!get('TERMII_API_KEY')&&!['TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_VERIFY_SERVICE_SID'].every(get))errors.push('Configure Termii or Twilio Verify');
if(['ZORA_DEMO_MODE','NEXT_PUBLIC_ZORA_DEMO_MODE'].some(key=>get(key)==='true'))errors.push('Demo mode must be disabled');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log('Zora server configuration validated (no connectivity or SMS delivery implied).');
