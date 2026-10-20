# Test Zora locally

From `C:\projects\ccsa-deploy\ccsa-zora`, run:

```powershell
pnpm dev:local
```

Open the **Test sign-in** URL printed in the terminal. It signs you into a synthetic local farmer profile and redirects to **http://localhost:3001/dashboard**. That profile lets you test real questions, photos, audio and conversation history without contacting production FIMS or sending SMS. OpenAI requests are real and billable; test conversation text is stored in the dedicated Zora Neon database.

The test link changes on restart. Keep the launcher running while testing. If port 3001 is occupied, stop the previous local server first. `pnpm dev:web` instead starts the ordinary app with the configured real FIMS integration and requires a real enabled identity.

## What to check

1. Choose light/dark mode and switch among the five languages.
2. Type a farming question; listen to the answer and continue the conversation.
3. Allow the browser microphone, tap to record, and tap again to finish.
4. Open Plants, select a clear JPEG/PNG/WebP under 2.5 MB, and ask about it.
5. Try the farm problem choices and reopen a saved conversation from History.
6. Resize to phone width and check the bottom navigation and microphone control.
7. Sign out; questions and private history must require sign-in again.

The local launcher is a separate development script, binds only to loopback and refuses production deployment environments. No authentication bypass route was added to the application. Local sessions are limited by the synthetic FIMS stub and stop working when it stops. This does not validate actual SMS delivery, production FIMS connectivity, physical device recording or native-speaker pronunciation.

## Deployment

Use the ordinary production build and real server secrets, never the local launcher. Follow `NEON_FIMS_ROLLOUT.md` for the additive FIMS migration, feature flag, hosting, SMS and device checks. Do not deploy the synthetic FIMS stub or expose its port publicly.

