import { phoneVerificationConfigured } from '@/server/phone-verification';
import { NextResponse } from 'next/server';
import { getDatabase } from '@/server/database';
import { queryFims } from '@/server/fims';
import { productionConfigurationIssues } from '@/server/env';
export const dynamic='force-dynamic';export const maxDuration=15;
export async function GET(){
 let database=false,fims=false;const configuration=productionConfigurationIssues();
 try{await getDatabase().client`SELECT 1 FROM zora_runtime.accounts LIMIT 1`;database=true;}catch{}
 try{await queryFims({type:'agent',id:'readiness-probe'});fims=true;}catch{}
 const phone=phoneVerificationConfigured();
 const ready=database&&fims&&phone&&configuration.length===0;
 return NextResponse.json({status:ready?'ready':'not_ready',checks:{database,fims,phone,configuration}}, {status:ready?200:503,headers:{'Cache-Control':'no-store'}});
}
