import { router } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { getMobileAccessToken,clearMobileAccessToken } from '@/auth/session';
export function apiBase(){const base=process.env.EXPO_PUBLIC_API_BASE_URL||process.env.EXPO_PUBLIC_ZORA_API_URL||'https://zora.cosmopolitan.edu.ng';if(!base||(!__DEV__&&!base.startsWith('https://')))throw new Error('Zora server address is not configured');return base.replace(/\/$/,'');}
export async function api(path:string,options:RequestInit={},authenticate=true){
 const token=await getMobileAccessToken();if(authenticate&&!token)throw new Error('Please sign in to Zora first');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);
 try{const response=await fetch(apiBase()+path,{...options,headers:{...(authenticate?{Authorization:'Bearer '+token}:{}),...options.headers},signal:controller.signal});
 if(response.status===401&&authenticate){await clearMobileAccessToken();router.replace('/login');}
 if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Zora is temporarily unavailable');}return response;
 }finally{clearTimeout(timer);}
}
export async function askZora(input:{message:string;language:string;conversationId?:string;image?:string}){return (await api('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})).json();}
export async function transcribe(uri:string,language:string){const form=new FormData();form.append('audio',{uri,name:'question.m4a',type:'audio/mp4'} as unknown as Blob);form.append('language',language);const data=await(await api('/api/assistant/transcribe',{method:'POST',body:form})).json();if(!data.text)throw new Error('Could not hear you. Please try again.');return data.text as string;}
let audioGeneration=0;
let stopCurrent:(()=>void)|undefined;
export function stopAudio(){audioGeneration++;stopCurrent?.();stopCurrent=undefined;}
export async function speakZora(text:string,language:string){
 stopAudio();const generation=audioGeneration;if(!text)return;
 const response=await api('/api/audio/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,language})});
 if(generation!==audioGeneration)return;
 const file=new File(Paths.cache,'zora-'+Date.now()+'.mp3');file.write(new Uint8Array(await response.arrayBuffer()));
 await setAudioModeAsync({allowsRecording:false,playsInSilentMode:true});
 if(generation!==audioGeneration){file.delete();return;}
 const player=createAudioPlayer(file.uri);
 await new Promise<void>((resolve)=>{let finished=false;const finish=()=>{if(finished)return;finished=true;subscription.remove();player.remove();try{file.delete();}catch{}stopCurrent=undefined;clearTimeout(timer);resolve();};const subscription=player.addListener('playbackStatusUpdate',status=>{if(status.didJustFinish)finish();});const timer=setTimeout(finish,180000);stopCurrent=finish;player.play();});
}
