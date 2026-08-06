# Zora offline field module

```text
field-scouting/
├── components/       # React Native Maps field-boundary context
├── data/             # Expo SQLite migrations and repositories
├── state/            # Zustand scouting and synchronization state
└── sync/             # Transactional outbox, pull cursor, and conflicts
```

SQLite is authoritative while a farmer or extension officer is offline. Every
local observation and its outbox envelope are committed in one exclusive
transaction. Client UUIDs and idempotency keys make retries safe. Media remains
local until it is SHA-256 hashed, uploaded, and acknowledged; the observation
can synchronize independently.

Zora's assistant screen uses the same FIMS field pack as its context. Native
voice capture is provided by Expo Audio and speech playback by Expo Speech.
Production speech-to-text and computer-vision providers connect through the
shared Zora advisory contract without weakening offline field evidence.

Server reconciliation uses version numbers:

- Accept a create only when its idempotency key has not been seen.
- Return the original receipt for a repeated idempotency key.
- Reject stale updates and retain the server record for explicit resolution.
- Never overwrite verified MRV or advisory evidence; corrections become new
  append-only audit records.
