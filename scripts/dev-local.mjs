/** Local integration harness. This is not imported by the web application. */
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

if(process.env.NODE_ENV==='production'||process.env.VERCEL)throw Error('Local test launcher cannot run in a deployment.');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const envFile=path.join(root,'apps/web/.env.local');
if(!fs.existsSync(envFile))throw Error('Configure apps/web/.env.local first. See LOCAL_TESTING.md.');
const env=Object.fromEntries(fs.readFileSync(envFile,'utf8').replace(/^\uFEFF/,'').split(/\r?\n/).filter(l=>/^[A-Z][A-Z0-9_]*=/.test(l)).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^(['"])(.*)\1$/,'$2')];}));
const port=Number(process.env.ZORA_LOCAL_PORT||3001),bridgePort=Number(process.env.ZORA_LOCAL_BRIDGE_PORT||3128);
if(![port,bridgePort].every(p=>Number.isInteger(p)&&p>=1024&&p<=65535)||port===bridgePort)throw Error('Invalid local ports.');
async function freePort(p){return new Promise((resolve,reject)=>{const probe=net.createServer();probe.once('error',()=>reject(Error(`Port ${p} is busy. Stop the old local server, then run pnpm dev:local again.`)));probe.listen(p,'127.0.0.1',()=>probe.close(resolve));});}
await freePort(port);await freePort(bridgePort);
const secret=crypto.randomBytes(48).toString('base64url');
const nonce=crypto.randomBytes(32).toString('base64url');
const subject='farmer:local-preview-'+crypto.randomUUID();
const origin=`http://localhost:${port}`;
const sign=value=>crypto.createHmac('sha256',secret).update(value).digest('base64url');
const assertion=()=>{const now=Math.floor(Date.now()/1000);const payload=Buffer.from(JSON.stringify({iss:'fims',aud:'zora',sub:subject,iat:now,exp:now+120,jti:crypto.randomUUID()})).toString('base64url');return payload+'.'+sign(payload);};
let child;
const bridge=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
  if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)||!['localhost:'+bridgePort,'127.0.0.1:'+bridgePort].includes(req.headers.host)){res.writeHead(403);res.end();return;}
  try{
    if(req.method==='GET'&&req.url==='/start/'+nonce){
      const response=await fetch(origin+'/api/auth/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assertion:assertion()}),signal:AbortSignal.timeout(30000)});
      const data=await response.json();if(!response.ok||typeof data.token!=='string')throw Error('Local sign-in could not complete; check the server console and Neon configuration.');
      res.setHeader('Set-Cookie',`zora_session=${data.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`);res.writeHead(302,{Location:origin+'/dashboard'});res.end();return;
    }
    if(req.method==='POST'&&req.url==='/api/internal/zora/access'){
      let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2048){res.writeHead(413);res.end();return;}}
      const stamp=req.headers['x-zora-timestamp'],signature=req.headers['x-zora-signature'];
      if(typeof stamp!=='string'||Math.abs(Date.now()-Number(stamp))>30000||typeof signature!=='string'||signature!==sign(stamp+'.'+raw)){res.writeHead(401);res.end();return;}
      const data=JSON.parse(raw);const enabled=data.type+':'+data.id===subject;
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify({enabled}));return;
    }
    res.writeHead(404);res.end('Not found');
  }catch{res.writeHead(503,{'Content-Type':'text/plain'});res.end('Local test sign-in unavailable. Check Neon configuration and the local server console.');}
});
await new Promise(r=>bridge.listen(bridgePort,'127.0.0.1',r));
child=spawn(process.execPath,[path.join(root,'apps/web/node_modules/next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port',String(port)],{cwd:path.join(root,'apps/web'),env:{...process.env,...env,NODE_ENV:'development',FIMS_API_URL:`http://127.0.0.1:${bridgePort}`,ZORA_FIMS_SHARED_SECRET:secret,NEXT_BUILD_DIR:'.next-local'},windowsHide:true,stdio:'inherit'});
child.on('exit',code=>{bridge.close();process.exitCode=code??0;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{child.kill();bridge.close();});
console.log(`\nLocal Zora: ${origin}\nTest sign-in: http://localhost:${bridgePort}/start/${nonce}\n`);
console.log('Synthetic FIMS identity only. OpenAI requests are real and billable; test conversation text is stored in your dedicated Zora Neon database. No production FIMS connection or SMS is used.');
