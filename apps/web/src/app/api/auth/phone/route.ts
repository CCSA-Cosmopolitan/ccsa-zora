import { readJsonBody, RequestBodyError } from '@/server/request-body';
import { NextRequest,NextResponse } from 'next/server';
import { createSession,consumeRateLimit,SESSION_COOKIE } from '@/server/session';
import { queryFims } from '@/server/fims';
import { phoneVerificationConfigured,sendPhoneCode,verifyPhoneCode } from '@/server/phone-verification';
export async function POST(request:NextRequest){
 let body;try{body=await readJsonBody(request,2048);}catch(error){return NextResponse.json({error:'Invalid or oversized request'},{status:error instanceof RequestBodyError?error.status:400});}
 const phone=String(body?.phone??'').replace(/[\s()-]/g,'').replace(/^0/,'+234').replace(/^234/,'+234');
 if(!/^\+234[789]\d{9}$/.test(phone)||!['start','verify'].includes(body?.action))return NextResponse.json({error:'Enter a valid Nigerian mobile number'},{status:400});
 const verifying=body.action==='verify';
 if(verifying&&!/^\d{6}$/.test(String(body.code??'')))return NextResponse.json({error:'Enter the six-digit code'},{status:400});
 if(!phoneVerificationConfigured())return NextResponse.json({error:'Phone sign-in is unavailable'},{status:503});
 try{
  if(!(await consumeRateLimit('otp:global:hour',Number(process.env.ZORA_OTP_HOURLY_LIMIT)||100,3600))||!(await consumeRateLimit('otp:'+body.action+':'+phone,verifying?5:3,600)))return NextResponse.json({error:'Please wait before trying again'},{status:429});
  if(!verifying){const access=await queryFims({phone});if(access.enabled)await sendPhoneCode(phone);return NextResponse.json({sent:true});}
  if(!(await verifyPhoneCode(phone,String(body.code))))return NextResponse.json({error:'The code is invalid or expired'},{status:401});
  const access=await queryFims({phone});
  if(!access.enabled||!access.subject)return NextResponse.json({error:'Ask your FIMS administrator to enable Zora for this phone number.'},{status:403});
  const token=await createSession(access.subject);
  if(!token)return NextResponse.json({error:'Zora access is disabled'},{status:403});
  const result=NextResponse.json({token,plan:'fims-sponsored',quota:null},{headers:{'Cache-Control':'no-store'}});
  result.cookies.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});
  return result;
 }catch{return NextResponse.json({error:'Sign-in is temporarily unavailable'},{status:503});}
}
