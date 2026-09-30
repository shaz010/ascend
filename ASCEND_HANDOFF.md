# Ascend — Session Handoff
Last updated: 2026-09-30 (session 2)

---

## Project Identity
- **Full name:** Ascend
- **Tagline:** Learn any language. Rise to any moment.
- **Author/Founder:** Shahbaz Mirshahi
- **GitHub repo:** https://github.com/shaz010/ascend
- **App prototype artifact:** https://claude.ai/artifact/YZGEykJB5XHPxGaD5VWVZq
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

## Languages

| Code | Language | Flag | Status |
|------|----------|------|--------|
| es | Spanish | 🇪🇸 | ✅ Active |
| fr | French | 🇫🇷 | ✅ Active |
| zh | Mandarin | 🇨🇳 | ✅ Active |
| fa | Persian | 🇮🇷 | ✅ Active |
| it | Italian | 🇮🇹 | ✅ Active |
| ru | Russian | 🇷🇺 | ✅ Active |
| ar | Arabic | 🇸🇦 | ✅ Active |
| tr | Turkish | 🇹🇷 | ⏳ Coming soon |

Priority order per Shaz: French, Spanish, (Mexican/Colombian), Russian, Turkish, Arabic

---

## Guide Characters

| Scenario | ES | FR | ZH | FA | IT | RU | AR |
|----------|----|----|-----|----|----|----|----|
| Business | Carlos (CEO) | Sophie (PDG) | 明明 (总裁) | دانیار (مدیرعامل) | Marco (Amministratore) | Алексей (Генеральный директор) | أحمد (المدير التنفيذي) |
| Survival | Rosa | Pierre | 梅 | نرگس | Giulia | Наташа | فاطمة |
| Social | Isabella | Camille | 雪 | شیرین | Valentina | Катя | ليلى |

---

## App Architecture (React Native / Expo)

- **Stack:** React Native + Expo SDK 57, TypeScript
- **File:** `~/Desktop/ascend/App.tsx` (single file, all screens)
- **GitHub:** https://github.com/shaz010/ascend (main branch)
- **Run:** `cd ~/Desktop/ascend && npx expo start --ios` (opens iPhone 17 Pro simulator)
- **Reload:** press `r` in the Expo terminal window after file changes
- **Install file:** `cp "$(ls -t ~/Downloads/App*.tsx | head -1)" ~/Desktop/ascend/App.tsx` (always use this — Mac saves duplicate downloads with numbered suffixes)

### Screens (state machine)
`splash → scenario → language → guide → convo → done`

### State
```ts
screen, scenario, lang, step, vocab[], chosen, showTranslation
```

### Data structure
- `CONVOS[scenario][lang]` → array of 5 exchanges
- Each exchange: `{ ai, ai_t, vocab:[{w,m}], choices:[{t,tr}] }`
- `GUIDES[scenario][lang]` → `{ name, role, avatar }`
- `LANG_VOICE[lang]` → BCP-47 code for expo-speech

### Voice (expo-speech)
- Installed: `npx expo install expo-speech`
- Speaks guide's line automatically on each exchange
- Rate: 0.88
- Stops when user taps a choice
- Language codes: es-ES, fr-FR, zh-CN, fa-IR, it-IT, ru-RU, ar-SA

### Stats
- 7 languages × 3 scenarios = **105 conversation exchanges**
- 2 vocab words per exchange = **210 vocabulary items**

---

## Branding
- **Primary color:** Gold `#C8981E` / bright `#E8C040`
- **Background:** Deep space black `#07050F`
- **Surface:** `#12101E` / `#1A1830`
- **Text:** Warm cream `#EDE0CC`
- **Fonts:** Cinzel (display/brand), Inter (UI)

---

## File Locations
| File | Location |
|------|----------|
| App (React Native) | `~/Desktop/ascend/App.tsx` |
| GitHub repo | https://github.com/shaz010/ascend |
| HTML prototype (old) | claude.ai artifact (see above) |
| Launch dashboard | claude.ai artifact (see above) |
| Handoff | https://raw.githubusercontent.com/shaz010/ascend/main/ASCEND_HANDOFF.md |

---

## Key Rules
- GitHub = Terminal commands only. Never ask Shaz to use the GitHub website.
- ALL instructions = Terminal commands ready to copy-paste
- Never delete files without explicit calm confirmation
- Handoff update every 30 minutes minimum during sessions
- ALWAYS use `cp "$(ls -t ~/Downloads/App*.tsx | head -1)" ~/Desktop/ascend/App.tsx` — never plain `cp ~/Downloads/App.tsx` (Mac numbers duplicate downloads)
- After major file delivery + install: restart Expo with `--clear` if anything seems stale

---

## Roadmap Status

### ✅ Phase 1 — Foundation (DONE)
- [x] Basic branding locked (gold/dark/Cinzel)
- [x] Core conversation engine spec and prototype
- [ ] App store developer accounts (Apple + Google)
- [ ] Domain: ascendlanguage.com or similar

### ✅ Phase 2 — Core Build (DONE in prototype)
- [x] React Native + Expo SDK 57
- [x] 7 languages active (ES FR ZH FA IT RU AR)
- [x] 3 scenarios × 7 languages = 105 exchanges
- [x] Voice: expo-speech TTS for all 7 languages
- [x] 6-screen state machine working on iOS simulator

### 🔲 Phase 3 — Next Steps (in order of ease)
1. [ ] **Turkish 🇹🇷** — add content, 30 min
2. [ ] **More scenarios** — Soldier, Spaceship, Terminal
3. [ ] **AI conversation** — replace static scripts with live Claude API
4. [ ] **Mic input** — expo-av or expo-speech speech recognition
5. [ ] **App icon + proper splash** — real assets
6. [ ] **Apple Developer account** — $99/yr
7. [ ] **Google Play Developer account** — $25 once
8. [ ] **App Store submission**

### Phase 4 — Scale
- [ ] AI-generated scenario expansion
- [ ] Community scenarios
- [ ] B2B: corporate language training

---

## Session Log
- 2026-09-30 (session 2): Added Persian 🇮🇷 + Italian 🇮🇹 + Russian 🇷🇺 + Arabic 🇸🇦. Now 7 languages × 3 scenarios = 105 exchanges. Added expo-speech TTS voice for all 7 languages — guide speaks every line automatically. All committed and pushed to GitHub (commits e039ef4, 2060baa). iOS Simulator confirmed working with voice. Old HTML prototype superseded by React Native app.
- 2026-09-29 (session 1): Project conceived. 3 scenarios × 3 languages prototype built. Launch dashboard built (6 phases, priority-sorted, particle effects). GitHub repo created at shaz010/ascend. ASCEND_HANDOFF.md initialized. React Native / Expo app built with full 6-screen state machine (splash→scenario→language→guide→convo→done). ES/FR/ZH working in iOS Simulator.
- 2026-09-26 (session 0 — concept): Ascend conceived during TAGJ session. Name approved by Shaz. Full app prototype written and published as Artifact.
