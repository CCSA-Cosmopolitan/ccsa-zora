import { NextResponse } from 'next/server';
export async function POST(){return NextResponse.json({error:'Ask your FIMS administrator to enable Zora on your existing farmer or agent record.'},{status:410,headers:{'Cache-Control':'no-store'}});}
