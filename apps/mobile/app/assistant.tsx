import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Volume2,
  Camera,
  Keyboard,
  Languages,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { LANGUAGES } from "@/features/i18n/languages";

import { askZora } from "@/services/assistant";

interface Message {
  id: string;
  sender: "user" | "zora";
  text: string;
  imageUri?: string;
  suggestedAction?: "photo" | "hear";
}

export default function AssistantScreen() {
  const { language, t, colors, isSpeaking, speakText, stopSpeaking } = useVoiceStore();
  const params = useLocalSearchParams<{ initialPrompt?: string; image?: string }>();
  const currentLang = LANGUAGES.find(l=>l.code===language) || LANGUAGES[4]!;
  const [messages,setMessages]=useState<Message[]>([]);
  const [inputVal,setInputVal]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const conversationId=useRef<string|undefined>(undefined);
  const active=useRef(true);
  useFocusEffect(useCallback(()=>{active.current=true;return()=>{active.current=false;void stopSpeaking();};},[stopSpeaking]));
  const pending=useRef(false);
  const started=useRef(false);
  useEffect(()=>{if(params.initialPrompt&&!started.current){started.current=true;void send(params.initialPrompt,params.image);}},[]);
  async function handleListenResponse(text:string){if(isSpeaking)await stopSpeaking();else try{await speakText(text);}catch(e){setError(e instanceof Error?e.message:'Voice unavailable');}}
  async function send(text:string,image?:string,imageUri?:string) {
    if(pending.current||!text.trim())return;pending.current=true;setBusy(true);setError('');
    setMessages(old=>[...old,{id:String(Date.now()),sender:'user',text,imageUri}]);
    try{const reply=await askZora({message:text,language,conversationId:conversationId.current,image});
      if(!active.current||AppState.currentState!=="active")return;
      conversationId.current=reply.conversationId;
      setMessages(old=>[...old,{id:String(Date.now())+'-reply',sender:'zora',text:reply.spoken}]);
      try{await speakText(reply.spoken);}catch{setError('Voice playback is unavailable. Tap to retry listening.');}
    }catch(e){setError(e instanceof Error?e.message:'Zora is temporarily unavailable');}
    finally{pending.current=false;setBusy(false);}
  }
  async function handleTakePhoto(){try{const permission=await ImagePicker.requestCameraPermissionsAsync();if(!permission.granted)throw new Error('Please allow camera access');const result=await ImagePicker.launchCameraAsync({quality:0.5,base64:true});const asset=result.assets?.[0];if(!result.canceled&&asset?.base64)await send(inputVal.trim()||'What can you observe about this plant? Ask me if more information is needed.','data:image/jpeg;base64,'+asset.base64,asset.uri);}catch(e){setError(e instanceof Error?e.message:'Camera unavailable');}}
  function handleSendMessage(){const text=inputVal.trim();if(!text||busy)return;setInputVal('');void send(text);}

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ZoraHeader mode="back" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          {t.tabs.askZora}
        </Text>

        <Pressable
          onPress={() => router.push("/language")}
          style={styles.languageIndicator}
        >
          <Languages size={16} color={colors.accent} />
          <Text style={[styles.languageText, { color: colors.accent }]}>
            {currentLang.nativeName}
          </Text>
        </Pressable>

        {busy && <Text style={{color:colors.textSecondary}}>…</Text>}
        {!!error && <Text accessibilityRole="alert" style={{color:"#991b1b"}}>{error}</Text>}
        <Pressable disabled={busy} onPress={handleTakePhoto}><Text style={{color:colors.accent,paddingVertical:12}}>📷 {t.chat.takePhoto}</Text></Pressable>
        <View style={styles.conversation}>
          {messages.map((m) => (
            <View key={m.id} style={styles.messageWrapper}>
              {m.sender === "user" ? (
                /* User Message Bubble */
                <View
                  style={[
                    styles.userBubble,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.userLabel, { color: colors.textSecondary }]}>
                    {t.chat.you}
                  </Text>
                  <Text style={[styles.userMessageText, { color: colors.text }]}>
                    {m.text}
                  </Text>
                  {m.imageUri ? (
                    <Image
                      source={{ uri: m.imageUri }}
                      style={styles.attachedImage}
                    />
                  ) : null}
                </View>
              ) : (
                /* Zora Response */
                <View style={styles.zoraBubble}>
                  <Text style={[styles.zoraLabel, { color: colors.accent }]}>
                    {t.chat.zora}
                  </Text>
                  <Text style={[styles.zoraMessageText, { color: colors.text }]}>
                    {m.text}
                  </Text>

                  {/* Actions under Zora response */}
                  <View style={styles.zoraActions}>
                    <Pressable
                      onPress={() => handleListenResponse(m.text)}
                      style={[
                        styles.actionButtonOutline,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <Volume2 size={20} color={colors.text} />
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: colors.text },
                        ]}
                      >
                        {isSpeaking ? "Dakata" : t.chat.listenResponse}
                      </Text>
                    </Pressable>

                    {m.suggestedAction === "photo" ? (
                      <Pressable
                        onPress={handleTakePhoto}
                        style={[
                          styles.actionButtonFilled,
                          { backgroundColor: colors.voicePillBg },
                        ]}
                      >
                        <Camera size={20} color={colors.voicePillText} />
                        <Text
                          style={[
                            styles.actionButtonTextFilled,
                            { color: colors.voicePillText },
                          ]}
                        >
                          {t.chat.takePhoto}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Input Field */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Keyboard size={20} color={colors.textMuted} />
          <TextInput
            value={inputVal}
            onChangeText={setInputVal}
            placeholder={t.orTypeHere}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
        </View>
      </ScrollView>

      {/* Floating Voice Pill */}
      <FloatingVoicePill disabled={busy} onRecordComplete={(text)=>{void send(text);}} />

      {/* Bottom Tab Bar */}
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  languageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginBottom: 24,
  },
  languageText: {
    fontSize: 15,
    fontWeight: "700",
  },
  conversation: {
    gap: 20,
    marginBottom: 20,
  },
  messageWrapper: {
    marginBottom: 8,
  },
  userBubble: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignSelf: "stretch",
  },
  userLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  attachedImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: "cover",
  },
  zoraBubble: {
    paddingVertical: 12,
  },
  zoraLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  zoraMessageText: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 16,
  },
  zoraActions: {
    gap: 12,
  },
  actionButtonOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionButtonFilled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionButtonTextFilled: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
