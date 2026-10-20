"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AudioLines,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  FileText,
  HelpCircle,
  ImagePlus,
  Keyboard,
  Languages,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Mic,
  Plus,
  Printer,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Square,
  Tractor,
  Volume2,
  X
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LANGUAGES, TRANSLATIONS, type SupportedLanguage } from '@/lib/farmer-copy';
import './farmer-app.css';

export type View = 'ask' | 'plants' | 'farm' | 'language' | 'history' | 'voice' | 'help' | 'privacy';
export type Phase = 'idle' | 'recording' | 'thinking' | 'speaking';

export interface SolutionDetails {
  spoken: string;
  diagnosis?: string;
  severity?: 'information' | 'low' | 'medium' | 'high';
  explanation?: string;
  steps?: string[];
  tips?: { tip: string; howToApply: string }[];
  organicAlternative?: string;
  safety?: string;
  followUp?: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  image?: string;
  safety?: string;
  details?: SolutionDetails;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  language: SupportedLanguage;
  created_at: string;
}

export interface ReportModalData {
  title: string;
  referenceId: string;
  date: string;
  language: SupportedLanguage;
  farmerQuestion?: string;
  image?: string;
  details?: SolutionDetails;
  conversation?: Message[];
}

const nav = [
  { id: 'ask', icon: MessageCircle, label: 'Ask Zora' },
  { id: 'voice', icon: AudioLines, label: 'Voice conversation' },
  { id: 'plants', icon: ScanLine, label: 'Identify a plant' },
  { id: 'farm', icon: Sprout, label: 'Farm assessment' },
  { id: 'history', icon: Clock3, label: 'History' },
] as const;

export function FarmerApp({ initialView = 'ask' }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [localProfile, setLocalProfile] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportModalData | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const id = useRef<string | undefined>(undefined);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | undefined>(undefined);
  const generation = useRef(0);
  const pending = useRef(false);
  const micPending = useRef(false);
  const alive = useRef(true);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  const copy = TRANSLATIONS[language];
  const selected = LANGUAGES.find(l => l.code === language)!;
  const busy = phase === 'thinking' || phase === 'recording';

  async function checkSession() {
    setChecking(true);
    try {
      const r = await fetch('/api/auth/session');
      if (r.status === 401) {
        setSignedIn(false);
        return;
      }
      if (!r.ok) throw Error('Access verification is unavailable. Please retry.');
      const data = await r.json();
      setSignedIn(true);
      setLocalProfile(String(data.user?.subject).includes(':local-preview-'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot check access');
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    alive.current = true;
    const saved = localStorage.getItem('zora.language');
    if (LANGUAGES.some(l => l.code === saved)) setLanguage(saved as SupportedLanguage);
    void checkSession();
    const hide = () => {
      if (document.hidden) {
        cancelRecording();
        stopAudio();
      }
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      alive.current = false;
      document.removeEventListener('visibilitychange', hide);
      cancelRecording();
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (messages.length) end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, phase]);

  useEffect(() => {
    if (view === 'history' && signedIn) void loadHistory();
  }, [view, signedIn]);

  function requireAccess() {
    if (signedIn) return true;
    setLoginPrompt(true);
    return false;
  }

  function changeLanguage(lang: SupportedLanguage) {
    stopAudio();
    setLanguage(lang);
    localStorage.setItem('zora.language', lang);
  }

  function stopAudio() {
    generation.current++;
    audio.current?.pause();
    audio.current = null;
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = undefined;
    if (alive.current) setPhase(p => p === 'speaking' ? 'idle' : p);
  }

  function cancelRecording() {
    clearTimeout(recordingTimer.current);
    const r = recorder.current;
    recorder.current = null;
    if (r) {
      r.onstop = null;
      if (r.state !== 'inactive') r.stop();
    }
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
    if (alive.current) setPhase(p => p === 'recording' ? 'idle' : p);
  }

  function go(next: View) {
    if (pending.current) return;
    cancelRecording();
    stopAudio();
    setError('');
    setView(next);
  }

  function fresh() {
    if (pending.current) return;
    cancelRecording();
    stopAudio();
    id.current = undefined;
    setMessages([]);
    setPhoto(undefined);
    setText('');
    setError('');
    setView('ask');
  }

  async function responseJson(r: Response) {
    const data = await r.json();
    if (r.status === 401) {
      setSignedIn(false);
      setLoginPrompt(true);
    }
    if (!r.ok) throw Error(data.error || 'Zora is temporarily unavailable. Please retry.');
    return data;
  }

  async function speak(content: string, lang = language) {
    if (!requireAccess()) return;
    stopAudio();
    const current = generation.current;
    setPhase('speaking');
    setError('');
    try {
      const r = await fetch('/api/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content.slice(0, 4000), language: lang }),
        signal: AbortSignal.timeout(60000)
      });
      if (!r.ok) {
        await responseJson(r);
        return;
      }
      const blob = await r.blob();
      if (!alive.current || current !== generation.current || document.hidden) return;
      const url = URL.createObjectURL(blob);
      audioUrl.current = url;
      const player = new Audio(url);
      audio.current = player;
      player.onended = () => {
        if (current === generation.current) stopAudio();
      };
      player.onerror = () => {
        if (current === generation.current) {
          stopAudio();
          setError('Audio could not play. Tap Listen to try again.');
        }
      };
      await player.play();
    } catch (e) {
      if (alive.current && current === generation.current) {
        setPhase('idle');
        setError(e instanceof Error ? e.message : 'Voice playback is unavailable');
      }
    }
  }

  async function ask(question: string, attached = photo, targetView: View = view) {
    if (!requireAccess() || pending.current || question.trim().length < 2) return;
    pending.current = true;
    stopAudio();
    setPhase('thinking');
    setError('');
    if (targetView !== 'voice') {
      setView('ask');
    }
    setText('');

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      image: attached,
      created_at: new Date().toISOString()
    };
    setMessages(old => [...old, userMsg]);

    try {
      const data = await responseJson(await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question.trim(), language, conversationId: id.current, image: attached }),
        signal: AbortSignal.timeout(60000)
      }));
      if (!alive.current) return;
      id.current = data.conversationId;
      setPhoto(undefined);

      const details: SolutionDetails = {
        spoken: data.spoken,
        diagnosis: data.diagnosis,
        severity: data.severity,
        explanation: data.explanation,
        steps: data.steps,
        tips: data.tips,
        organicAlternative: data.organicAlternative,
        safety: data.safety,
        followUp: data.followUp,
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.spoken,
        safety: data.safety,
        details,
        created_at: new Date().toISOString()
      };

      setMessages(old => [...old, assistantMsg]);
      setPhase('idle');
      if (!document.hidden) void speak(data.spoken);
    } catch (e) {
      if (alive.current) {
        setError(e instanceof Error ? e.message : 'Could not get an answer');
        setText(question);
        setPhase('idle');
      }
    } finally {
      pending.current = false;
    }
  }

  async function record() {
    if (phase === 'speaking') {
      stopAudio();
      return;
    }
    if (phase === 'recording') {
      recorder.current?.stop();
      return;
    }
    if (!requireAccess() || pending.current || micPending.current) return;
    micPending.current = true;
    stopAudio();
    setError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current || document.hidden) {
        media.getTracks().forEach(t => t.stop());
        return;
      }
      stream.current = media;
      const chunks: Blob[] = [];
      const r = new MediaRecorder(media);
      recorder.current = r;
      r.ondataavailable = e => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onerror = () => {
        cancelRecording();
        setError('Recording failed. Please try again.');
      };
      r.onstop = async () => {
        clearTimeout(recordingTimer.current);
        media.getTracks().forEach(t => t.stop());
        recorder.current = null;
        stream.current = null;
        if (!alive.current) return;
        pending.current = true;
        setPhase('thinking');
        try {
          const body = new FormData();
          const mime = r.mimeType || 'audio/webm';
          body.append('audio', new Blob(chunks, { type: mime }), mime.includes('mp4') ? 'question.m4a' : 'question.webm');
          body.append('language', language);
          const data = await responseJson(await fetch('/api/assistant/transcribe', {
            method: 'POST',
            body,
            signal: AbortSignal.timeout(60000)
          }));
          pending.current = false;
          if (!alive.current || document.hidden) {
            setPhase('idle');
            return;
          }
          await ask(data.text, undefined, view);
        } catch (e) {
          if (alive.current) {
            setError(e instanceof Error ? e.message : 'Could not hear you. Please try again.');
            setPhase('idle');
          }
        } finally {
          pending.current = false;
        }
      };
      r.start();
      setPhase('recording');
      recordingTimer.current = setTimeout(() => {
        if (r.state !== 'inactive') r.stop();
      }, 60000);
    } catch {
      setError('Allow microphone access in your browser, then try again. You can also type below.');
    } finally {
      micPending.current = false;
    }
  }

  async function choosePhoto(file?: File) {
    if (!file) return;
    if (file.size > 2500000) {
      setError('Choose a photo smaller than 2.5 MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG or WebP photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setError('');
    };
    reader.onerror = () => setError('Could not open this photo.');
    reader.readAsDataURL(file);
  }

  async function loadHistory() {
    setLoadingHistory(true);
    setError('');
    try {
      const data = await responseJson(await fetch('/api/conversations'));
      setConversations(data.conversations);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'History unavailable');
    } finally {
      setLoadingHistory(false);
    }
  }

  async function openConversation(c: Conversation) {
    setLoadingHistory(true);
    setError('');
    try {
      const data = await responseJson(await fetch('/api/conversations?id=' + encodeURIComponent(c.id)));
      stopAudio();
      id.current = c.id;

      const parsedMessages: Message[] = (data.messages || []).map((m: any) => {
        if (m.role === 'assistant') {
          try {
            if (typeof m.content === 'string' && m.content.trim().startsWith('{')) {
              const parsed = JSON.parse(m.content);
              return {
                id: String(m.id),
                role: m.role,
                content: parsed.spoken || m.content,
                safety: parsed.safety,
                details: parsed,
                created_at: m.created_at,
              };
            }
          } catch {
            // Not a serialized JSON, keep legacy string
          }
        }
        return {
          id: String(m.id),
          role: m.role,
          content: m.content,
          created_at: m.created_at,
        };
      });

      setMessages(parsedMessages);
      changeLanguage(c.language);
      setPhoto(undefined);
      setView('ask');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot open conversation');
    } finally {
      setLoadingHistory(false);
    }
  }

  async function signOut() {
    cancelRecording();
    stopAudio();
    try {
      await responseJson(await fetch('/api/auth/session', { method: 'DELETE' }));
      setSignedIn(false);
      setLocalProfile(false);
      fresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign out');
    }
  }

  function openSingleSolutionReport(assistantMsg: Message, userMsg?: Message) {
    const ref = `CCSA-ZORA-ADV-${Date.now().toString(36).toUpperCase()}`;
    const dateStr = new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' });
    setActiveReport({
      title: assistantMsg.details?.diagnosis || 'Agronomic Advisory & Solution Report',
      referenceId: ref,
      date: dateStr,
      language,
      farmerQuestion: userMsg?.content || 'Field crop consultation',
      image: userMsg?.image || assistantMsg.image,
      details: assistantMsg.details || { spoken: assistantMsg.content },
    });
  }

  function openFullConversationReport() {
    const ref = `CCSA-ZORA-DOSSIER-${Date.now().toString(36).toUpperCase()}`;
    const dateStr = new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' });
    const firstUser = messages.find(m => m.role === 'user');
    setActiveReport({
      title: 'Full Farm Consultation Advisory Dossier',
      referenceId: ref,
      date: dateStr,
      language,
      farmerQuestion: firstUser?.content || 'Complete consultation thread',
      conversation: messages,
    });
  }

  function copyReportToClipboard(report: ReportModalData) {
    let t = `========================================================\n`;
    t += `CENTRE FOR CLIMATE-SMART AGRICULTURE (CCSA)\n`;
    t += `Cosmopolitan University Abuja\n`;
    t += `OFFICIAL AGRO-ECOLOGICAL ADVISORY REPORT\n`;
    t += `Reference Code: ${report.referenceId}\n`;
    t += `Date & Time: ${report.date}\n`;
    t += `Advisory Language: ${LANGUAGES.find(l => l.code === report.language)?.name || report.language}\n`;
    t += `========================================================\n\n`;

    if (report.details) {
      t += `PRIMARY ASSESSMENT / DIAGNOSIS:\n${report.details.diagnosis || 'Agronomic Assessment'}\n`;
      t += `SEVERITY LEVEL: ${(report.details.severity || 'Information').toUpperCase()}\n\n`;
      t += `FARMER INQUIRY / OBSERVATION:\n${report.farmerQuestion || 'N/A'}\n\n`;
      t += `EXPERT AGRO-ECOLOGICAL EVALUATION:\n${report.details.explanation || report.details.spoken}\n\n`;

      if (report.details.steps?.length) {
        t += `PRESCRIBED STEP-BY-STEP ACTION PLAN:\n`;
        report.details.steps.forEach((s, idx) => {
          t += `${idx + 1}. ${s}\n`;
        });
        t += `\n`;
      }

      if (report.details.tips?.length) {
        t += `FIELD APPLICATION PROTOCOLS & DOSAGE TIPS:\n`;
        report.details.tips.forEach(tp => {
          t += `• ${tp.tip}: ${tp.howToApply}\n`;
        });
        t += `\n`;
      }

      if (report.details.organicAlternative) {
        t += `LOW-COST ORGANIC / REGENERATIVE ALTERNATIVE:\n${report.details.organicAlternative}\n\n`;
      }

      if (report.details.safety) {
        t += `SAFETY & HANDLING GUIDELINES:\n${report.details.safety}\n\n`;
      }

      if (report.details.followUp) {
        t += `RECOMMENDED FOLLOW-UP: ${report.details.followUp}\n\n`;
      }
    } else if (report.conversation?.length) {
      t += `COMPLETE FIELD CONSULTATION TRANSCRIPT:\n\n`;
      report.conversation.forEach(m => {
        t += `[${m.role === 'user' ? 'FARMER' : 'CCSA ZORA ADVISOR'}]\n${m.content}\n\n`;
      });
    }

    t += `========================================================\n`;
    t += `Grounded in agricultural research from IITA, NIHORT, AfricaRice, and NiMet.\n`;
    t += `Cosmopolitan University Abuja · Centre for Climate-Smart Agriculture\n`;
    t += `========================================================\n`;

    navigator.clipboard.writeText(t);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  }

  const title = view === 'ask' ? copy.tabs.askZora
    : view === 'plants' ? copy.plantsPage.title
    : view === 'farm' ? copy.farmPage.title
    : view === 'language' ? copy.languagePage.title
    : view === 'voice' ? copy.zoraLive
    : view === 'history' ? 'Your conversations'
    : view === 'privacy' ? 'Your account & privacy'
    : 'Help & support';

  const tabs = [
    { id: 'ask', icon: MessageCircle, label: copy.tabs.askZora },
    { id: 'plants', icon: Sprout, label: copy.tabs.plants },
    { id: 'farm', icon: Tractor, label: copy.tabs.farm },
    { id: 'language', icon: Languages, label: copy.tabs.language }
  ] as const;

  const composer = (
    <form
      className="zora-compose"
      onSubmit={e => {
        e.preventDefault();
        void ask(text || 'What can you observe about this plant or farm photo? Ask me for more details.', photo);
      }}
    >
      <Keyboard size={23}/>
      <input
        aria-label={copy.orTypeHere}
        placeholder={copy.orTypeHere}
        value={text}
        disabled={busy}
        onChange={e => setText(e.target.value)}
      />
      <button
        type="button"
        aria-label="Attach a farm photo"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <ImagePlus size={22}/>
      </button>
      <button
        type="submit"
        aria-label="Send question"
        disabled={busy || (!photo && text.trim().length < 2)}
      >
        <Send size={21}/>
      </button>
    </form>
  );

  return (
    <div className="zora-app">
      <aside className="zora-sidebar">
        <Link href="/" aria-label="Zora home" className="zora-brand">
          <img src="/brand/zora-square.jpeg" alt="Zora"/>
        </Link>
        <p className="zora-workspace">Your farming companion</p>
        <p className="zora-muted">{localProfile ? 'Local test profile' : signedIn ? 'CCSA · Free access' : 'Welcome to Zora'}</p>
        <button className="zora-new" onClick={fresh} disabled={busy}>
          <Plus size={19}/> New conversation
        </button>
        <nav aria-label="Main navigation">
          {nav.map(n => (
            <button
              key={n.id}
              disabled={busy}
              aria-current={view === n.id ? 'page' : undefined}
              onClick={() => go(n.id)}
            >
              <n.icon size={23}/>
              {n.id === 'ask' ? copy.tabs.askZora : n.id === 'plants' ? copy.identifyPlant : n.id === 'farm' ? copy.checkFarmProblem : n.label}
            </button>
          ))}
        </nav>
        <div className="zora-sidebar-bottom">
          <button onClick={() => go('help')}><HelpCircle size={19}/> Help & support</button>
          <button onClick={() => go('privacy')}><ShieldCheck size={19}/> Account & privacy</button>
          {signedIn ? (
            <button onClick={() => void signOut()} disabled={busy}><LogOut size={19}/> Sign out</button>
          ) : (
            <Link href="/login">Sign in to Zora <ChevronRight size={18}/></Link>
          )}
          <small>Developed by CCSA<br/>Cosmopolitan University Abuja</small>
        </div>
      </aside>

      <div className="zora-workspace-body">
        <header className="zora-topbar">
          <Link className="zora-mobile-brand" href="/" aria-label="Zora home">
            <img src="/brand/zora-square.jpeg" alt="Zora"/>
          </Link>
          <span className="zora-breadcrumb">Personal <span>/</span> {title}</span>
          <div className="zora-top-actions">
            <ThemeToggle/>
            <button className="zora-language-button" disabled={busy} onClick={() => go('language')}>
              <Languages size={23}/>
              {selected.nativeName}
            </button>
            {!signedIn && !checking && <Link className="zora-signin" href="/login">Sign in</Link>}
          </div>
        </header>

        <main className="zora-main" lang={language === 'pcm' ? 'en' : language}>
          {localProfile && <div className="zora-test-note">Local test profile · Real AI requests · No production FIMS records</div>}
          {error && (
            <div role="alert" className="zora-error">
              <span>{error}</span>
              <button aria-label="Dismiss error" onClick={() => setError('')}><X size={18}/></button>
            </div>
          )}

          {/* Ask Zora Home Welcome */}
          {view === 'ask' && messages.length === 0 && (
            <section className="zora-welcome">
              <p className="zora-eyebrow">{copy.yourFarmingCompanion}</p>
              <h1>{copy.homeTitle}</h1>
              <p className="zora-intro">{copy.homeSubtitle}</p>
              <button className="zora-listen" onClick={() => void speak(selected.speechSample)} disabled={busy}>
                <Volume2/>{copy.hearHowToUse}
              </button>
              {composer}
              <div className="zora-actions">
                <button onClick={() => go('plants')}>
                  <ScanLine/>
                  <span>
                    <strong>{copy.identifyPlant}</strong>
                    <small>{copy.identifyPlantSub}</small>
                  </span>
                  <ChevronRight/>
                </button>
                <button onClick={() => go('farm')}>
                  <Sprout/>
                  <span>
                    <strong>{copy.checkFarmProblem}</strong>
                    <small>{copy.checkFarmProblemSub}</small>
                  </span>
                  <ChevronRight/>
                </button>
                <button onClick={() => go('voice')}>
                  <AudioLines/>
                  <span>
                    <strong>{copy.zoraLive}</strong>
                    <small>{copy.zoraLiveSub}</small>
                  </span>
                  <ChevronRight/>
                </button>
              </div>
            </section>
          )}

          {/* Conversation Chat View */}
          {view === 'ask' && messages.length > 0 && (
            <section className="zora-conversation">
              <div className="zora-section-title">
                <h1>{copy.tabs.askZora}</h1>
                <div className="zora-conversation-header-actions">
                  <button className="zora-outline zora-dossier-btn" onClick={openFullConversationReport}>
                    <FileText size={18}/> Export Report
                  </button>
                  <button className="zora-listen" disabled={busy} onClick={fresh}>
                    <Plus size={20}/> New
                  </button>
                </div>
              </div>
              <p className="zora-listen"><Languages size={19}/> {selected.nativeName} ({selected.name})</p>

              {messages.map((m, idx) => {
                if (m.role === 'user') {
                  return (
                    <article key={m.id} className="zora-message user">
                      <strong>{copy.chat.you}</strong>
                      {m.image && <img className="zora-message-photo" src={m.image} alt="Your farm photo"/>}
                      <p>{m.content}</p>
                    </article>
                  );
                }

                const details = m.details;
                const prevUser = idx > 0 && messages[idx - 1]?.role === 'user' ? messages[idx - 1] : undefined;

                return (
                  <article key={m.id} className="zora-message assistant">
                    <div className="zora-assistant-topline">
                      <div className="zora-assistant-badge-group">
                        <strong>Zora</strong>
                        {details?.severity && (
                          <span className={`zora-severity-badge severity-${details.severity}`}>
                            {details.severity === 'high' ? 'Act Today' : details.severity === 'medium' ? 'Act Soon' : details.severity === 'low' ? 'Watch Closely' : 'Advisory'}
                          </span>
                        )}
                      </div>
                      <button
                        className="zora-doc-report-trigger"
                        onClick={() => openSingleSolutionReport(m, prevUser)}
                        title="Generate documented report"
                      >
                        <FileText size={16}/> Documented Report
                      </button>
                    </div>

                    {details?.diagnosis && (
                      <h2 className="zora-solution-diagnosis-heading">
                        {details.diagnosis}
                      </h2>
                    )}

                    <p className="zora-spoken-text">{m.content}</p>

                    <div className="zora-message-action-row">
                      <button className="zora-outline" disabled={busy} onClick={() => void speak(m.content)}>
                        <Volume2 size={18}/> {copy.chat.listenResponse}
                      </button>
                      <button className="zora-outline zora-report-mini-btn" onClick={() => openSingleSolutionReport(m, prevUser)}>
                        <Printer size={18}/> Export Solution
                      </button>
                    </div>

                    {/* Rich Detailed Agronomic Breakdown */}
                    {details && (details.explanation || details.steps?.length || details.tips?.length || details.organicAlternative) && (
                      <div className="zora-solution-detail-card">
                        {details.explanation && (
                          <div className="zora-detail-block">
                            <h4>🔬 Comprehensive Agronomic Assessment</h4>
                            <p>{details.explanation}</p>
                          </div>
                        )}

                        {details.steps && details.steps.length > 0 && (
                          <div className="zora-detail-block">
                            <h4>📋 Prescribed Action Steps</h4>
                            <ol className="zora-steps-numbered">
                              {details.steps.map((step, sIdx) => (
                                <li key={sIdx}>
                                  <span className="step-counter">{sIdx + 1}</span>
                                  <span className="step-desc">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {details.tips && details.tips.length > 0 && (
                          <div className="zora-detail-block">
                            <h4>💡 Field Application Protocols & Tips</h4>
                            <div className="zora-tips-container">
                              {details.tips.map((tp, tIdx) => (
                                <div key={tIdx} className="zora-tip-card">
                                  <strong>{tp.tip}</strong>
                                  <p>{tp.howToApply}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {details.organicAlternative && (
                          <div className="zora-detail-block zora-organic-block">
                            <h4>🌿 Low-Cost Organic / Regenerative Alternative</h4>
                            <p>{details.organicAlternative}</p>
                          </div>
                        )}

                        {details.safety && (
                          <div className="zora-detail-block zora-safety-block">
                            <h4>🛡️ Safety & Precautions</h4>
                            <p>{details.safety}</p>
                          </div>
                        )}

                        {details.followUp && (
                          <div className="zora-detail-block zora-followup-block">
                            <h4>❓ Recommended Follow-Up Question</h4>
                            <p>{details.followUp}</p>
                            <button
                              className="zora-quick-followup-btn"
                              disabled={busy}
                              onClick={() => void ask(details.followUp!)}
                            >
                              Ask Zora this next →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {!details && m.safety && (
                      <details><summary>Helpful guidance</summary><p>{m.safety}</p></details>
                    )}
                  </article>
                );
              })}

              {phase === 'thinking' && (
                <p className="zora-processing" role="status">
                  <LoaderCircle className="zora-spin"/> Zora is reasoning…
                </p>
              )}
              {composer}
              <div ref={end}/>
            </section>
          )}

          {/* Plant Identification Panel */}
          {view === 'plants' && (
            <section className="zora-panel">
              <h1>{copy.plantsPage.title}</h1>
              <p className="zora-intro">{copy.plantsPage.cameraInstruction}</p>
              <div className="zora-photo-zone">
                {photo ? <img src={photo} alt="Selected plant"/> : (
                  <>
                    <ScanLine size={58} strokeWidth={1.2}/>
                    <p>A clear photo helps Zora see the details.</p>
                  </>
                )}
              </div>
              <div className="zora-button-grid">
                <button className="zora-primary" onClick={() => camera.current?.click()}><Camera/>{copy.plantsPage.takePhoto}</button>
                <button className="zora-outline" onClick={() => input.current?.click()}><ImagePlus/>{copy.plantsPage.choosePhoto}</button>
              </div>
              {photo && (
                <button
                  className="zora-primary zora-full"
                  disabled={busy}
                  onClick={() => void ask('Help me identify this plant. Describe visible features, explain uncertainty, and ask for more details if needed.', photo)}
                >
                  <ScanLine/> Ask Zora about this plant
                </button>
              )}
              <button className="zora-listen" onClick={() => void speak(copy.plantsPage.cameraInstruction)}>
                <Volume2/>{copy.plantsPage.hearCameraGuidance}
              </button>
              <p className="zora-note">{copy.plantsPage.safetyWarning}</p>
            </section>
          )}

          {/* Farm Assessment Panel */}
          {view === 'farm' && (
            <section className="zora-panel">
              <h1>{copy.farmPage.title}</h1>
              <p className="zora-intro">{copy.farmPage.subtitle}</p>
              <div className="zora-actions">
                {[
                  { icon: Sprout, title: copy.farmPage.cropDisease, sub: copy.farmPage.cropDiseaseSub, prompt: 'Help me check a crop problem. Ask me about the crop and the symptoms first.' },
                  { icon: Tractor, title: copy.farmPage.farmArea, sub: copy.farmPage.farmAreaSub, prompt: 'Help me assess my farm. Ask me what I grow and what I want to improve.' },
                  { icon: ScanLine, title: copy.farmPage.soil, sub: copy.farmPage.soilSub, prompt: 'Help me understand a soil problem. Ask about the soil, crop and recent weather. Do not infer laboratory values from a photo.' }
                ].map(item => (
                  <button key={item.title} onClick={() => void ask(item.prompt)}>
                    <item.icon/>
                    <span><strong>{item.title}</strong><small>{item.sub}</small></span>
                    <ChevronRight/>
                  </button>
                ))}
              </div>
              <button className="zora-listen" onClick={() => void speak([copy.farmPage.subtitle, copy.farmPage.cropDisease, copy.farmPage.farmArea, copy.farmPage.soil].join('. '))}>
                <Volume2/>{copy.farmPage.hearChoices}
              </button>
            </section>
          )}

          {/* Language Selection Panel */}
          {view === 'language' && (
            <section className="zora-panel">
              <h1>{copy.languagePage.title}</h1>
              <p className="zora-intro">{copy.languagePage.subtitle}</p>
              <div className="zora-languages">
                {LANGUAGES.map(l => (
                  <div key={l.code}>
                    <button className="zora-language-choice" onClick={() => changeLanguage(l.code)} aria-pressed={language === l.code}>
                      <span className={language === l.code ? 'zora-radio selected' : 'zora-radio'}>
                        {language === l.code && <Check size={18}/>}
                      </span>
                      <span>
                        {l.name} {l.code === 'en' ? '(Standard English)' : l.code === 'pcm' ? '(Naija Pidgin)' : ''}
                        {language === l.code && <small>{copy.languagePage.selected}</small>}
                      </span>
                    </button>
                    <button className="zora-hear" aria-label={'Hear ' + l.name} onClick={() => void speak(l.speechSample, l.code)}>
                      <Volume2 size={22}/>{copy.languagePage.hear}
                    </button>
                  </div>
                ))}
              </div>
              <p className="zora-note">{copy.languagePage.disclaimer}</p>
            </section>
          )}

          {/* Zora Live (Centered Voice Hub) */}
          {view === 'voice' && (
            <section className="zora-panel zora-voice-view">
              <div className="zora-voice-hero">
                <div className="zora-voice-live-badge">
                  <Sparkles size={16}/>
                  <span>ZORA LIVE · NATURAL AGRO-VOICE</span>
                </div>

                <div className={`zora-live-orb-container state-${phase}`}>
                  <div className={`zora-live-orb-glow state-${phase}`}/>
                  <div className="zora-live-orb-core">
                    {phase === 'recording' ? (
                      <div className="zora-soundwave-bars">
                        <span className="sw-bar b1"/>
                        <span className="sw-bar b2"/>
                        <span className="sw-bar b3"/>
                        <span className="sw-bar b4"/>
                        <span className="sw-bar b5"/>
                      </div>
                    ) : phase === 'speaking' ? (
                      <div className="zora-soundwave-bars playing">
                        <span className="sw-bar b1"/>
                        <span className="sw-bar b2"/>
                        <span className="sw-bar b3"/>
                        <span className="sw-bar b4"/>
                        <span className="sw-bar b5"/>
                      </div>
                    ) : phase === 'thinking' ? (
                      <LoaderCircle size={64} className="zora-spin"/>
                    ) : (
                      <AudioLines size={64} strokeWidth={1.3}/>
                    )}
                  </div>
                </div>

                <h1 className="zora-voice-title">{copy.zoraLive}</h1>
                <p className="zora-voice-lead">
                  {phase === 'recording'
                    ? copy.listeningSpeakNow
                    : phase === 'thinking'
                    ? 'CCSA Zora is analyzing your agricultural question…'
                    : phase === 'speaking'
                    ? 'Zora is answering… Tap the button below to pause audio.'
                    : 'Tap the microphone below. Speak naturally about your crops, pests, soil, or seasonal planning.'}
                </p>

                {/* Central Perfectly Aligned Microphone Action */}
                <div className="zora-voice-center-control">
                  <button
                    className={`zora-mic zora-live-main-btn ${phase === 'recording' ? 'recording' : ''}`}
                    onClick={() => void record()}
                    disabled={phase === 'thinking' || checking}
                    aria-label={phase === 'recording' ? copy.stopRecording : phase === 'speaking' ? 'Stop playback' : copy.tapToSpeak}
                  >
                    {phase === 'thinking' ? (
                      <LoaderCircle className="zora-spin" size={26}/>
                    ) : phase === 'recording' || phase === 'speaking' ? (
                      <Square size={24}/>
                    ) : (
                      <Mic size={28}/>
                    )}
                    <span>
                      {phase === 'thinking'
                        ? 'Zora is thinking…'
                        : phase === 'recording'
                        ? copy.stopRecording
                        : phase === 'speaking'
                        ? 'Stop playback'
                        : copy.tapToSpeak}
                    </span>
                  </button>
                  <p className="zora-voice-subhint">
                    {phase === 'recording' ? 'Tap when finished speaking' : copy.askInOwnWords}
                  </p>
                </div>

                {/* Instant 1-Tap Language Selection Bar */}
                <div className="zora-live-lang-selector">
                  <span className="zora-lang-tag">Speaking Language:</span>
                  <div className="zora-lang-pills">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        className={`zora-lang-pill ${language === l.code ? 'selected' : ''}`}
                        onClick={() => changeLanguage(l.code)}
                      >
                        {l.name}
                        {l.code === 'en' ? ' (English)' : l.code === 'pcm' ? ' (Pidgin)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="zora-listen zora-live-hear-btn" onClick={() => void speak(selected.speechSample)}>
                  <Volume2 size={18}/> {copy.hearHowToUse}
                </button>

                {/* Recent Solution Card In Live View */}
                {(() => {
                  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
                  if (!lastAssistant) return null;
                  return (
                    <div className="zora-live-recent-box">
                      <div className="zora-recent-header">
                        <Sparkles size={16}/>
                        <span>Latest Agronomic Guidance</span>
                        <button className="zora-doc-btn" onClick={() => openSingleSolutionReport(lastAssistant)}>
                          <FileText size={15}/> Documented Report
                        </button>
                      </div>
                      {lastAssistant.details?.diagnosis && (
                        <h3 className="zora-recent-diagnosis">{lastAssistant.details.diagnosis}</h3>
                      )}
                      <p className="zora-recent-text">{lastAssistant.content}</p>
                      <div className="zora-recent-actions">
                        <button className="zora-outline" onClick={() => void speak(lastAssistant.content)}>
                          <Volume2 size={16}/> Replay Speech
                        </button>
                        <button className="zora-primary" onClick={() => go('ask')}>
                          <MessageCircle size={16}/> View Full Action Plan & History
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

          {/* History Panel */}
          {view === 'history' && (
            <section className="zora-panel">
              <div className="zora-section-title">
                <h1>Your conversations</h1>
                <button onClick={fresh} aria-label="New conversation"><Plus/></button>
              </div>
              <p className="zora-intro">Return to a question or pick up where you left off.</p>
              {!signedIn ? (
                <Link className="zora-primary" href="/login">Sign in to see your history</Link>
              ) : loadingHistory ? (
                <p role="status">Loading your conversations…</p>
              ) : conversations.length === 0 ? (
                <div className="zora-empty">
                  <MessageCircle size={40}/>
                  <h2>No conversations yet</h2>
                  <p>Your questions will appear here after you talk to Zora.</p>
                  <button className="zora-primary" onClick={fresh}>Ask your first question</button>
                </div>
              ) : (
                <div className="zora-history">
                  {conversations.map(c => (
                    <button key={c.id} onClick={() => void openConversation(c)}>
                      <MessageCircle/>
                      <span>
                        <strong>{c.title || 'Farm conversation'}</strong>
                        <small>{new Date(c.created_at).toLocaleDateString()} · {LANGUAGES.find(l => l.code === c.language)?.nativeName}</small>
                      </span>
                      <ChevronRight/>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Help Panel */}
          {view === 'help' && (
            <section className="zora-panel">
              <h1>Here to help you get started.</h1>
              <div className="zora-help">
                <h2>Speak in your own language</h2>
                <p>Choose your language (Standard English, Hausa, Yorùbá, Igbo, or Nigerian Pidgin), tap the microphone, and describe what is happening on your farm.</p>
                <h2>Original English & Dialect Separation</h2>
                <p>When English is selected, Zora answers strictly in professional Standard English. Nigerian Pidgin is only spoken when you explicitly select Pidgin.</p>
                <h2>Documented Reports</h2>
                <p>Tap "Documented Report" on any solution or conversation to generate and print or save an official CCSA Agricultural Advisory Report.</p>
                <h2>When you need local help</h2>
                <p>Zora provides verified guidance, not a laboratory-confirmed test. For persistent crop problems or chemical emergencies, contact your LGA Agricultural Extension Officer.</p>
              </div>
              <button className="zora-primary" onClick={() => go('ask')}><Mic/> Talk to Zora</button>
            </section>
          )}

          {/* Privacy Panel */}
          {view === 'privacy' && (
            <section className="zora-panel">
              <h1>Your account & privacy</h1>
              <div className="zora-help">
                <h2>{signedIn ? 'Free access through CCSA' : 'Your private farming companion'}</h2>
                <p>FIMS controls your access. Enabled accounts have no subscription quota. Short request limits help keep the service available.</p>
                <h2>Your questions belong to your account</h2>
                <p>OpenAI processes questions, voice recordings and attached photos to produce answers. Conversation text is saved privately in Neon. Your history is only available through your account.</p>
              </div>
              {signedIn ? (
                <button className="zora-outline" onClick={() => void signOut()}><LogOut/> Sign out</button>
              ) : (
                <Link href="/login" className="zora-primary">Sign in</Link>
              )}
            </section>
          )}

          {photo && view === 'ask' && (
            <div className="zora-attachment">
              <img src={photo} alt="Photo ready to send"/>
              <span>Photo ready to send</span>
              <button aria-label="Remove photo" onClick={() => setPhoto(undefined)}><X size={20}/></button>
            </div>
          )}

          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { void choosePhoto(e.target.files?.[0]); e.target.value = ''; }}/>
          <input ref={camera} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={e => { void choosePhoto(e.target.files?.[0]); e.target.value = ''; }}/>
        </main>

        {/* Fixed Voice Dock - Hidden in voice/live view because voice view has its own centered interactive mic */}
        {!['history', 'help', 'privacy', 'voice'].includes(view) && (
          <div className="zora-voice-dock">
            <button
              className={'zora-mic ' + (phase === 'recording' ? 'recording' : '')}
              onClick={() => void record()}
              disabled={phase === 'thinking' || checking}
              aria-label={phase === 'recording' ? copy.stopRecording : phase === 'speaking' ? 'Stop playback' : copy.tapToSpeak}
            >
              {phase === 'thinking' ? (
                <LoaderCircle className="zora-spin"/>
              ) : phase === 'recording' || phase === 'speaking' ? (
                <Square size={23}/>
              ) : (
                <Mic size={27}/>
              )}
              <span>
                {phase === 'thinking'
                  ? 'Zora…'
                  : phase === 'recording'
                  ? copy.stopRecording
                  : phase === 'speaking'
                  ? 'Stop playback'
                  : copy.tapToSpeak}
              </span>
            </button>
            <p role="status">{phase === 'recording' ? copy.listeningSpeakNow : copy.askInOwnWords}</p>
          </div>
        )}

        <nav className="zora-bottom-nav" aria-label="Mobile navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              disabled={busy}
              aria-current={view === tab.id ? 'page' : undefined}
              onClick={() => go(tab.id)}
            >
              <tab.icon size={25}/>
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            disabled={busy}
            aria-current={view === 'history' ? 'page' : undefined}
            onClick={() => go('history')}
          >
            <Clock3 size={25}/>
            <span>History</span>
          </button>
        </nav>
      </div>

      {/* Documented Report Modal */}
      {activeReport && (
        <div className="zora-modal-backdrop zora-report-backdrop" onClick={() => setActiveReport(null)}>
          <div className="zora-report-modal" onClick={e => e.stopPropagation()}>
            <div className="zora-report-toolbar">
              <div className="zora-report-toolbar-left">
                <FileText size={22}/>
                <strong>Documented Advisory Report</strong>
              </div>
              <div className="zora-report-toolbar-actions">
                <button
                  className="zora-report-tool-btn"
                  onClick={() => copyReportToClipboard(activeReport)}
                  title="Copy text report"
                >
                  {copiedReport ? <Check size={18}/> : <Copy size={18}/>}
                  <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  className="zora-report-tool-btn primary"
                  onClick={() => window.print()}
                  title="Print or Save as PDF"
                >
                  <Printer size={18}/>
                  <span>Print / PDF</span>
                </button>
                <button
                  className="zora-report-tool-btn close"
                  aria-label="Close report"
                  onClick={() => setActiveReport(null)}
                >
                  <X size={20}/>
                </button>
              </div>
            </div>

            {/* Official Report Document Body */}
            <div className="zora-report-sheet" id="ccsa-advisory-printable-sheet">
              {/* Institution Header / Masthead */}
              <div className="zora-rep-header">
                <div className="zora-rep-logo-block">
                  <img src="/brand/zora-square.jpeg" alt="CCSA Logo" className="zora-rep-logo"/>
                  <div>
                    <h2 className="zora-rep-inst">CENTRE FOR CLIMATE-SMART AGRICULTURE (CCSA)</h2>
                    <p className="zora-rep-subinst">Cosmopolitan University Abuja · Agricultural Research & Extension Division</p>
                    <p className="zora-rep-dept">Technical Field Advisory & Diagnostic Research Bulletin</p>
                  </div>
                </div>
                <div className="zora-rep-title-badge">
                  <span>OFFICIAL RESEARCH BULLETIN</span>
                  <small>CCSA-DIAG-EXT</small>
                </div>
              </div>

              {/* Research Metadata Table */}
              <table className="zora-rep-meta-table">
                <tbody>
                  <tr>
                    <th>DOCUMENT REFERENCE</th>
                    <td><strong>{activeReport.referenceId}</strong></td>
                    <th>DATE &amp; TIME OF ISSUE</th>
                    <td>{activeReport.date}</td>
                  </tr>
                  <tr>
                    <th>ADVISORY LANGUAGE</th>
                    <td>
                      <strong>{LANGUAGES.find(l => l.code === activeReport.language)?.name || activeReport.language} {activeReport.language === 'en' ? '(Standard English)' : ''}</strong>
                    </td>
                    <th>ISSUING AUTHORITY</th>
                    <td><span className="zora-rep-verified">✓ CCSA Verified Agronomic Core · Cosmopolitan Univ.</span></td>
                  </tr>
                </tbody>
              </table>

              {/* Section 1: Farmer Observation & Specimen Inquiry */}
              <div className="zora-rep-section">
                <h3 className="zora-rep-sec-title">1.0 FIELD OBSERVATION &amp; SPECIMEN INQUIRY</h3>
                <div className="zora-rep-inquiry-box">
                  <p className="zora-rep-inquiry-text">{activeReport.farmerQuestion || 'Farmer field consultation submitted for autonomous agronomic assessment.'}</p>
                  {activeReport.image && (
                    <div className="zora-rep-photo-wrap">
                      <img src={activeReport.image} alt="Submitted field crop" className="zora-rep-photo"/>
                      <span className="zora-rep-photo-caption">Figure 1.0: In-situ specimen photograph submitted from field for diagnostic evaluation.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment / Solution Details */}
              {activeReport.details ? (
                <>
                  <div className="zora-rep-section">
                    <h3 className="zora-rep-sec-title">2.0 TECHNICAL AGRO-ECOLOGICAL ASSESSMENT &amp; DIAGNOSIS</h3>
                    <div className="zora-rep-diagnosis-block">
                      <div className="zora-rep-diag-head">
                        <div>
                          <span className="zora-rep-diag-label">PRIMARY AGRONOMIC DIAGNOSIS:</span>
                          <h4 className="zora-rep-diag-title">{activeReport.details.diagnosis || 'Field Agronomic Assessment'}</h4>
                        </div>
                        {activeReport.details.severity && (
                          <span className={`zora-severity-badge severity-${activeReport.details.severity}`}>
                            [DIAGNOSTIC STATUS: {activeReport.details.severity.toUpperCase()} SEVERITY]
                          </span>
                        )}
                      </div>
                      <p className="zora-rep-diag-desc">
                        {activeReport.details.explanation || activeReport.details.spoken}
                      </p>
                    </div>
                  </div>

                  {activeReport.details.steps && activeReport.details.steps.length > 0 && (
                    <div className="zora-rep-section">
                      <h3 className="zora-rep-sec-title">3.0 PRESCRIBED ACTION PROTOCOL &amp; INTERVENTION SEQUENCE</h3>
                      <div className="zora-rep-action-list">
                        {activeReport.details.steps.map((step, sIdx) => (
                          <div key={sIdx} className="zora-rep-action-item">
                            <span className="zora-rep-action-num">PROTOCOL 3.{sIdx + 1}</span>
                            <p className="zora-rep-action-text">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeReport.details.tips && activeReport.details.tips.length > 0 && (
                    <div className="zora-rep-section">
                      <h3 className="zora-rep-sec-title">4.0 FIELD APPLICATION PROTOCOLS &amp; DOSAGE GUIDELINES</h3>
                      <table className="zora-rep-formal-table">
                        <thead>
                          <tr>
                            <th style={{ width: '32%' }}>INTERVENTION / INPUT</th>
                            <th>APPLICATION METHODOLOGY, RATE &amp; TIMING</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeReport.details.tips.map((tp, tIdx) => (
                            <tr key={tIdx}>
                              <td><strong>{tp.tip}</strong></td>
                              <td>{tp.howToApply}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeReport.details.organicAlternative && (
                    <div className="zora-rep-section">
                      <h3 className="zora-rep-sec-title">5.0 AGROECOLOGICAL &amp; LOW-COST REGENERATIVE ALTERNATIVE</h3>
                      <div className="zora-rep-organic-box">
                        <span className="zora-rep-box-label">REGENERATIVE PROTOCOL:</span>
                        <p>{activeReport.details.organicAlternative}</p>
                      </div>
                    </div>
                  )}

                  {activeReport.details.safety && (
                    <div className="zora-rep-section">
                      <h3 className="zora-rep-sec-title">6.0 CHEMICAL STEWARDSHIP, PPE &amp; ENVIRONMENTAL PRECAUTIONS</h3>
                      <div className="zora-rep-safety-box">
                        <span className="zora-rep-safety-label">MANDATORY SAFETY COMPLIANCE:</span>
                        <p>{activeReport.details.safety}</p>
                      </div>
                    </div>
                  )}

                  {activeReport.details.followUp && (
                    <div className="zora-rep-section">
                      <h3 className="zora-rep-sec-title">7.0 RECOMMENDED FIELD MONITORING &amp; DIAGNOSTIC FOLLOW-UP</h3>
                      <div className="zora-rep-followup-box">
                        <span className="zora-rep-followup-label">FOLLOW-UP INQUIRIES FOR CONTINUED FIELD EVALUATION:</span>
                        <p className="zora-rep-followup-text">{activeReport.details.followUp}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : activeReport.conversation?.length ? (
                <div className="zora-rep-section">
                  <h3 className="zora-rep-sec-title">2.0 COMPLETE CONSULTATION TRANSCRIPT</h3>
                  <div className="zora-rep-transcript">
                    {activeReport.conversation.map((cMsg, i) => (
                      <div key={i} className={`zora-rep-t-msg ${cMsg.role}`}>
                        <strong>{cMsg.role === 'user' ? 'FARMER' : 'CCSA ZORA ADVISOR'}:</strong>
                        <p>{cMsg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Official Disclaimer & Seal */}
              <div className="zora-rep-footer">
                <div className="zora-rep-seal-block">
                  <p className="zora-rep-seal-title">OFFICIAL ADVISORY CERTIFICATION &amp; METHODOLOGY</p>
                  <p className="zora-rep-seal-text">
                    This technical research bulletin is issued by the Centre for Climate-Smart Agriculture (CCSA) at Cosmopolitan University Abuja. Diagnostic recommendations are standardized in alignment with crop protection protocols from IITA, NIHORT, AfricaRice, ICRISAT, and NiMet agro-meteorological advisories. For suspected acute chemical toxicities or rapid epidemic wilt, contact your LGA Agricultural Extension Officer immediately.
                  </p>
                </div>
                <div className="zora-rep-sign-block">
                  <div className="zora-rep-line"/>
                  <span>CCSA Agricultural Extension Intelligence</span>
                  <small>Cosmopolitan University Abuja · Federal Capital Territory, Nigeria</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {loginPrompt && (
        <div className="zora-modal-backdrop" onClick={() => setLoginPrompt(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="zora-login-title"
            className="zora-modal"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="zora-modal-close"
              aria-label="Close sign-in prompt"
              onClick={() => setLoginPrompt(false)}
            >
              <X/>
            </button>
            <img src="/brand/zora-square.jpeg" alt="Zora"/>
            <h2 id="zora-login-title">Let’s get you started</h2>
            <p>Sign in with the phone number registered in FIMS. Your administrator can enable your free access.</p>
            <Link className="zora-primary" href="/login">Sign in to Zora <ChevronRight size={20}/></Link>
            <button className="zora-listen" onClick={() => setLoginPrompt(false)}>Back to Zora</button>
          </section>
        </div>
      )}
    </div>
  );
}
