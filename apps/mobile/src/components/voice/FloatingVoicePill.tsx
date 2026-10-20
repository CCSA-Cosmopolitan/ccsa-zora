import { useEffect,useRef,useState,useCallback } from 'react';
import { View,Text,Pressable,Alert,AppState } from 'react-native';
import { Mic,Square } from 'lucide-react-native';
import { useAudioRecorder,RecordingPresets,requestRecordingPermissionsAsync,setAudioModeAsync } from 'expo-audio';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useVoiceStore } from '@/features/voice/voice-store';
import { transcribe,stopAudio } from '@/services/assistant';
export function FloatingVoicePill({onRecordComplete,disabled=false}:{onRecordComplete?:(text:string)=>void;disabled?:boolean}){
 const [focused,setFocused]=useState(true);useFocusEffect(useCallback(()=>{setFocused(true);return()=>setFocused(false);},[]));const active=useRef(true);const isRecording=useRef(false);
 const {t,colors,language}=useVoiceStore();const recorder=useAudioRecorder(RecordingPresets.HIGH_QUALITY);
 const [recording,setRecording]=useState(false);const [busy,setBusy]=useState(false);const lock=useRef(false);
 useEffect(()=>{active.current=focused;const cancel=()=>{active.current=false;if(isRecording.current){isRecording.current=false;void recorder.stop().catch(()=>{});}setRecording(false);stopAudio();};if(!focused)cancel();const sub=AppState.addEventListener('change',state=>{if(state!=='active')cancel();else active.current=focused;});return()=>{sub.remove();active.current=false;if(isRecording.current){isRecording.current=false;void recorder.stop().catch(()=>{});}stopAudio();};},[focused,recorder]);
 async function finish(){if(lock.current)return;lock.current=true;setRecording(false);setBusy(true);try{isRecording.current=false;await recorder.stop();if(!active.current)return;if(!recorder.uri)throw new Error('Recording was not saved');const text=await transcribe(recorder.uri,language);if(!active.current)return;if(onRecordComplete)onRecordComplete(text);else router.push({pathname:'/assistant',params:{initialPrompt:text}});}catch(e){Alert.alert('Zora',e instanceof Error?e.message:'Could not hear you');}finally{lock.current=false;setBusy(false);}}
 useEffect(()=>{if(!recording)return;const timer=setTimeout(()=>void finish(),60000);return()=>clearTimeout(timer);},[recording]);
 async function press(){if(recording){await finish();return;}if(disabled||busy||lock.current)return;lock.current=true;try{stopAudio();const permission=await requestRecordingPermissionsAsync();if(!active.current)return;if(!permission.granted)throw new Error('Please allow microphone access');await setAudioModeAsync({allowsRecording:true,playsInSilentMode:true});await recorder.prepareToRecordAsync();if(!active.current)return;recorder.record();isRecording.current=true;setRecording(true);}catch(e){Alert.alert('Zora',e instanceof Error?e.message:'Microphone unavailable');}finally{lock.current=false;}}
 return <View style={{alignItems:'center',paddingVertical:10}}><Pressable accessibilityRole="button" accessibilityLabel={recording?t.stopRecording:t.tapToSpeak} disabled={busy||disabled} onPress={press} style={{flexDirection:'row',alignItems:'center',gap:12,padding:20,borderRadius:50,backgroundColor:recording?'#991b1b':colors.voicePillBg}}>{recording?<Square color="white"/>:<Mic color={colors.voicePillText}/>}<Text style={{color:recording?'white':colors.voicePillText,fontWeight:'bold'}}>{busy?'…':recording?t.stopRecording:t.tapToSpeak}</Text></Pressable><Text style={{color:colors.textSecondary,marginTop:8}}>{recording?t.listeningSpeakNow:t.askInOwnWords}</Text></View>;
}
