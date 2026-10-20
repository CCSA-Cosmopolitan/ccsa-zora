import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
export const getMobileAccessToken=()=>SecureStore.getItemAsync('zora.session');
export const saveMobileAccessToken=(token:string)=>SecureStore.setItemAsync('zora.session',token);
export const clearMobileAccessToken=()=>SecureStore.deleteItemAsync('zora.session');
export async function getDeviceId(){const key='zora.device-id';const old=await SecureStore.getItemAsync(key);if(old)return old;const id=Crypto.randomUUID();await SecureStore.setItemAsync(key,id);return id;}
