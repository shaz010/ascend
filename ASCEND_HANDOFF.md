# Ascend — Session Handoff
Last updated: 2026-09-30 (session 3)

---

## Project Identity
- **Full name:** Ascend
- **Tagline:** Learn any language. Rise to any moment.
- **Author/Founder:** Shahbaz Mirshahi
- **GitHub repo:** https://github.com/shaz010/ascend
- **Launch dashboard artifact:** https://claude.ai/artifact/MjzaU5NapxuBmY5NvrYs8C

---

## Concept
Scenario-based immersive language learning. No rote drilling. Real-world pressure situations that make learning feel urgent, alive, and joyous. AI conversation partner guides you through scenarios with vocabulary, multiple-choice replies, and translations in real time.

### Core Philosophy
- Transform the pain of learning into joyous education
- Accomplishment → higher heights (not gamification for its own sake)
- Immersion through narrative pressure — you NEED to speak to survive/succeed

---

## Scenarios (Implemented)

| ID | Name | Premise |
|----|------|---------|
| business | Business Immersion | You've just inherited a company — all workers speak a foreign language |
| survival | Survival | Stranded in a foreign country, must navigate to safety |
| social | Social Game | Surrounded by stunning company who only speak another language |

### Future Scenarios (Shaz's vision)
- Soldier: comrades slain, must communicate with locals
- Spaceship: crew speaks alien/foreign language, mission depends on it
- Terminal: 6 months to live, bucket list requires language

---

## Languages (8 Active)

| Code | Language | Flag | Status |
|------|----------|------|--------|
| es | Spanish | 🇪🇸 | ✅ Active |
| fr | French | 🇫🇷 | ✅ Active |
| zh | Mandarin | 🇨🇳 | ✅ Active |
| fa | Persian | 🇮🇷 | ✅ Active |
| it | Italian | 🇮🇹 | ✅ Active |
| ru | Russian | 🇷🇺 | ✅ Active |
| ar | Arabic | 🇸🇦 | ✅ Active |
| tr | Turkish | 🇹🇷 | ✅ Active (added session 3) |

8 languages × 3 scenarios × 5 exchanges = **120 conversation exchanges**

---

## App Architecture (React Native / Expo)

- **Stack:** React Native + Expo SDK 57, TypeScript
- **File:** `~/Desktop/ascend/App.tsx` — single file, all screens
- **Current size:** 66,430 bytes (as of session 3 end)
- **GitHub:** https://github.com/shaz010/ascend (main branch)
- **Run (iPhone via tunnel):** `cd ~/Desktop/ascend && npx expo start --tunnel`
- **Run (same WiFi):** `cd ~/Desktop/ascend && npx expo start` — iPhone appears in Expo Go automatically
- **Manual connect:** `ipconfig getifaddr en0` → in Expo Go tap "Enter URL manually" → `exp://[IP]:8081`
- **Reload:** press `r` in Expo terminal after file changes
- **Expo account:** shahbazmirshahi (logged in via `npx expo login -u shahbazmirshahi`)

### Screens (state machine)
`splash → scenario → language → guide → convo → done`

### State
```ts
screen, scenario, lang, step, vocab[], chosen, showTranslation,
tappedWord, tappedIndex, bilingualTap
```

### Data structure
- `CONVOS[scenario][lang]` → array of 5 exchanges
- Each exchange: `{ ai, ai_t, vocab:[{w,m}], choices:[{t,tr}] }`
- `GUIDES[scenario][lang]` → `{ name, role, avatar }`
- `LANG_VOICE[lang]` → BCP-47 code for expo-speech

### Voice (expo-speech)
- Rate: 0.88 (full sentence), 0.82 (word tap)
- Speaks guide's line automatically on each exchange
- Stops when user taps a choice
- Language codes: es-ES, fr-FR, zh-CN, fa-IR, it-IT, ru-RU, ar-SA, tr-TR

---

## Word-Tap Feature (NEW — session 3)

Each word in the AI sentence is a **tappable chip**:
- Tap any word → speaks that word in the target language
- If **bilingual tap ON**: speaks foreign word → 300ms pause → speaks English translation word at same index
- If **bilingual tap OFF**: speaks foreign word only
- Tapped word flashes gold in the AI bubble
- Matching word in the English translation also lights up bright gold (when translation shown)
- Toggle button top-left of convo screen: **"🔊 EN off"** / **"🔇 EN on"**
- Toggle was moved to left side to avoid iOS settings gear overlap (top-right)

### Key functions
```ts
speakWord(word, index) // speaks word + optional EN translation
bilingualTap: boolean  // state toggle, default true
tappedIndex: number    // tracks which word is highlighted
```

---

## Branding
- **Primary color:** Gold `#C8981E` / bright `#E8C040`
- **Background:** Deep space black `#07050F`
- **Surface:** `#12101E` / `#1A1830`
- **Text:** Warm cream `#EDE0CC`
- **Muted:** `#6B6490`

---

## File Locations
| File | Location |
|------|----------|
| App (React Native) | `~/Desktop/ascend/App.tsx` |
| GitHub repo | https://github.com/shaz010/ascend |
| Launch dashboard | https://claude.ai/artifact/MjzaU5NapxuBmY5NvrYs8C |
| Handoff | https://raw.githubusercontent.com/shaz010/ascend/main/ASCEND_HANDOFF.md |

---

## Key Rules
- GitHub = Terminal commands only. Never use the GitHub website.
- ALL instructions = Terminal commands ready to copy-paste
- Never delete files without explicit calm confirmation
- File delivery: always use unique output name (App_v4.tsx etc) + `force: true` on device_commit_files to avoid caching issue
- ALWAYS use `cp "$(ls -t ~/Downloads/App*.tsx | head -1)" ~/Desktop/ascend/App.tsx` — never plain cp

---

## Session Log

### 2026-09-30 (session 3)
- ✅ Added Turkish 🇹🇷 — 8th language, 3 scenarios × 5 exchanges = 15 new exchanges (commit 58c438a)
- ✅ Word-tap replay — each AI word is a tappable chip, speaks just that word (commit 5391b71)
- ✅ Translation word highlight — tapped word lights matching English word gold (commit 07d90e7)
- ✅ Bilingual tap — speaks foreign + English consecutively on tap (commit 5dd1733)
- ✅ Bilingual tap toggle — gold pill top-left to turn EN off/on (commit 5ae6f00)
- ✅ Toggle moved left — was hidden behind iOS gear icon (commit pending push)
- ⚠️ Expo tunnel keeps dropping (ngrok free tier limit) — use `npx expo start` on same WiFi or manual IP entry

### 2026-09-30 (session 2)
- Added Persian, Italian, Russian, Arabic. 7 languages × 3 scenarios = 105 exchanges.
- expo-speech TTS added for all languages. iOS Simulator confirmed working.

### 2026-09-29 (session 1)
- Project conceived. 3 scenarios × 3 languages. React Native + Expo app built.
- GitHub repo created: shaz010/ascend. ASCEND_HANDOFF.md initialized.

---

## Roadmap — Next Up

### Immediate
1. [ ] Fix Expo tunnel stability (or set up proper WiFi testing)
2. [ ] Test word-tap + bilingual toggle on real iPhone

### Near-term
3. [ ] More scenarios — Soldier, Spaceship, Terminal
4. [ ] AI conversation — replace static scripts with live Claude API
5. [ ] Mic input — expo-av speech recognition
6. [ ] App icon + proper splash screen

### Later
7. [ ] Apple Developer account ($99/yr)
8. [ ] Google Play Developer account ($25 once)
9. [ ] App Store submission
10. [ ] ElevenLabs voice integration (natural voices — Shaz has API key)

---

## ElevenLabs Note
Shaz has an ElevenLabs API key (in TAGJ_HANDOFF.md). Agreed to integrate later for natural voices once cost model is worked out. Will replace expo-speech TTS calls.
