"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/zora-public';
export default function LoginPage() {
  const router = useRouter();
  const [phone,setPhone] = useState(''); const [code,setCode] = useState('');
  const [sent,setSent] = useState(false); const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/phone', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ phone, code, action:sent?'verify':'start' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sign-in failed');
      if (sent) router.replace('/dashboard'); else setSent(true);
    } catch(cause) { setError(cause instanceof Error ? cause.message : 'Sign-in unavailable'); }
    finally { setBusy(false); }
  }
  return <AuthShell><h1>{sent?'Check your phone':'Welcome back'}</h1><p>{sent?`Enter the six-digit code sent to ${phone}.`:'Sign in to continue to your farming companion.'}</p>
    <form onSubmit={submit}>
      {!sent && <label className="zp-field">Phone number<input type="tel" pattern="(\+234|234|0)[789][0-9]{9}" autoComplete="tel" required value={phone} onChange={e=>setPhone(e.target.value)} disabled={busy} placeholder="08012345678" /></label>}
      {sent && <><p className="zp-muted">If your number has enabled access, your code will arrive shortly.</p><label className="zp-field">Verification code<input style={{letterSpacing:12,fontSize:28}} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} disabled={busy} /></label></>}
      {error && <div role="alert" className="zp-note zp-error">{error}</div>}
      <button disabled={busy} className="zp-button">{busy?'Please wait…':sent?'Verify and open Zora':'Send sign-in code'}</button>
      {sent && <button className="zp-button zp-outline" type="button" disabled={busy} onClick={()=>{setSent(false);setCode('');setError('');}}>Change number or request a new code</button>}
    </form><div className="zp-note"><strong>Free access through FIMS</strong><p>Your administrator must enable Zora on your farmer or agent record. Use the phone number registered in FIMS. No password or payment is required.</p></div><p className="zp-small">Agents signed into CCSA Mobile can open Zora from their existing account.</p><Link href="/request-access">New to Zora? Get access →</Link>
  </AuthShell>;
}
