export function productionConfigurationIssues() {
 const issues:string[]=[];
 for(const name of ['DATABASE_URL','OPENAI_API_KEY','FIMS_API_URL','ZORA_FIMS_SHARED_SECRET'])if(!process.env[name]?.trim())issues.push('missing_'+name.toLowerCase());
 if((process.env.ZORA_FIMS_SHARED_SECRET?.length??0)<32)issues.push('weak_fims_shared_secret');
 try{const db=new URL(process.env.DATABASE_URL??'');if(!db.hostname.endsWith('.neon.tech')||db.searchParams.get('sslmode')!=='require'||decodeURIComponent(db.username)!=='zora_runtime_app')issues.push('unsafe_database_url');}catch{issues.push('invalid_database_url');}
 try{if(new URL(process.env.FIMS_API_URL??'').protocol!=='https:')issues.push('unsafe_fims_url');}catch{issues.push('invalid_fims_url');}
 return issues;
}
export function assertProductionConfiguration(){if(process.env.NODE_ENV!=='production')return;const issues=productionConfigurationIssues();if(issues.length)throw new Error('Production configuration is incomplete: '+issues.join(', '));}
