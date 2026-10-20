import { createHmac } from 'node:crypto';
import { getDatabase } from './database';
function phoneHash(phone:string){const secret=process.env.ZORA_FIMS_SHARED_SECRET;if(!secret||secret.length<32)throw new Error('OTP configuration missing');return createHmac('sha256',secret).update('phone-verification:'+phone).digest('hex');}
export function phoneVerificationConfigured(){return Boolean(process.env.TERMII_API_KEY || (process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN&&process.env.TWILIO_VERIFY_SERVICE_SID));}
async function termii(path:string,body:Record<string,unknown>){
 const base=new URL(process.env.TERMII_BASE_URL||'https://v3.api.termii.com');
 if(base.protocol!=='https:'||!/(^|\.)termii\.(com|ai)$/.test(base.hostname))throw new Error('Invalid verification provider');
 const response=await fetch(base.origin+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,api_key:process.env.TERMII_API_KEY}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Phone verification unavailable');return response.json();
}
async function twilio(phone:string,code?:string){
 const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,service=process.env.TWILIO_VERIFY_SERVICE_SID;
 if(!sid||!token||!service)throw new Error('Phone verification unavailable');
 const response=await fetch('https://verify.twilio.com/v2/Services/'+encodeURIComponent(service)+'/'+(code?'VerificationCheck':'Verifications'),{method:'POST',headers:{Authorization:'Basic '+Buffer.from(sid+':'+token).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({To:phone,...(code?{Code:code}:{Channel:'sms'})}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Phone verification unavailable');return response.json();
}
export async function sendPhoneCode(phone:string){
 if(!process.env.TERMII_API_KEY){await twilio(phone);return;}
 const data=await termii('/api/sms/otp/send',{message_type:'NUMERIC',pin_type:'NUMERIC',to:phone.slice(1),from:process.env.TERMII_SENDER_ID||'CCSA',channel:process.env.TERMII_CHANNEL||'generic',pin_attempts:5,pin_time_to_live:10,pin_length:6,pin_placeholder:'<code>',message_text:'Your Zora sign-in code is <code>. It expires in 10 minutes. Do not share this code.'});
 if(typeof data.pin_id!=='string'||data.pin_id.length>200)throw new Error('Invalid verification response');
 await getDatabase().client`INSERT INTO zora_runtime.phone_verifications(phone_hash,pin_id,expires_at) VALUES (${phoneHash(phone)},${data.pin_id},now()+interval '10 minutes') ON CONFLICT(phone_hash) DO UPDATE SET pin_id=EXCLUDED.pin_id,expires_at=EXCLUDED.expires_at`;
}
export async function verifyPhoneCode(phone:string,code:string){
 if(!process.env.TERMII_API_KEY)return (await twilio(phone,code)).status==='approved';
 const {client}=getDatabase();const key=phoneHash(phone);
 const rows=await client`SELECT pin_id FROM zora_runtime.phone_verifications WHERE phone_hash=${key} AND expires_at>now()`;
 const pin=rows[0]?.pin_id;if(!pin)return false;
 const data=await termii('/api/sms/otp/verify',{pin_id:pin,pin:code});
 if(String(data.verified).toLowerCase()!=='true'||String(data.msisdn).replace(/^\+/,'')!==phone.slice(1))return false;
 const consumed=await client`DELETE FROM zora_runtime.phone_verifications WHERE phone_hash=${key} AND pin_id=${pin} AND expires_at>now() RETURNING phone_hash`;
 return consumed.length===1;
}
