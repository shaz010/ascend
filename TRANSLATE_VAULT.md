# Ascend — Translation Vault
**Last updated:** 2026-10-05 (session 7)
**Owner:** Shaz (chabokchamejun@gmail.com)
**Repo:** github.com/shaz010/ascend

---

## ⚠️ VAULT RULES

- **TRANSLATE_VAULT.md** = Ascend feature handoff (this file)
- **Master_Vault.html** = Global tracker (Your Salon Pro, TaxRight, App Store status)
- **ASCEND_HANDOFF.md** = Ascend app architecture + edit rules
- When working on Ascend features: load THIS file only

---

## ⚠️ CRITICAL LESSONS — NEVER REPEAT

### 1. EAS build ALWAYS needs git push first
EAS pulls from GitHub — NOT local disk. If App.tsx isn't pushed, the build uses old code.

```bash
cd ~/Desktop/ascend
git add App.tsx
git commit -m "describe the fix"
git push
npx eas-cli build --platform ios --profile preview
```

### 2. device_commit_files silently fails for App.tsx — NEVER use it
Only working write method:
```python
# via device_bash:
path = os.path.expanduser('~') + '/mnt/Desktop/ascend/App.tsx'
with open(path, 'w') as f:
    f.write(content)
```
Always grep-verify immediately after writing.

### 3. EAS exhausted until Nov 1
Use `npx expo run:ios --device` for native builds.
Use `npx expo start --clear --host lan` for JS-only changes.
Metro must run at `192.168.0.130:8081` for iPhone dev builds.

---

## Current App State — v1.3 ✅ CONFIRMED ON DEVICE

All fixes confirmed working on iPhone as of Oct 5, 2026.

| Fix | Status |
|-----|--------|
| v1.3 gold badge on splash | ✅ Confirmed |
| nargessId state declared | ✅ Confirmed |
| Nargess voice detected by name | ✅ Confirmed |
| EN word highlight proportional map | ✅ Confirmed |
| RTL word highlight (FA/AR) | ✅ Fixed & confirmed |
| Vocab chips tappable + speak FA then EN | ✅ Confirmed |
| Choice buttons speak FA on tap | ✅ Confirmed |
| showVoicePrompt state | ✅ Confirmed |
| RTL_LANGS constant | ✅ Confirmed |
| Choice buttons outside ScrollView / onPress | ✅ Confirmed |
| LEARNED WORDS dual boxes (FA + EN, each tappable) | ✅ Confirmed on device |
| !!chosen guard (YOU SAID + Next) | ✅ Confirmed |
| iOS 27 UIScene crash fix | ✅ Confirmed |
| Blank screen / SplashScreen.hideAsync() | ✅ Confirmed |

---

## Upcoming Abilities — Queue

| # | Feature | Status |
|---|---------|--------|
| A | LEARNED WORDS dual boxes — FA + EN separate tappable boxes | ✅ Done |
| B | Translate screen (EN ↔ all 8 languages) | 🟡 Queued |
| C | Speech-to-Text (Whisper) — beats Apple STT for all ignored languages | 🟡 Queued |

---

## Feature B — Translate Screen Plan

**Concept:** Bidirectional translator built into Ascend. All 8 languages. No separate app.

| Step | Task |
|------|------|
| 1 | Install @react-native-voice/voice |
| 2 | Add mic permissions to app.json |
| 3 | Add 'translate' to Screen type |
| 4 | Add Translate button to Splash (bottom corner) |
| 5 | Build Translate screen UI — language pair toggle, input, output |
| 6 | Wire MyMemory API — fetch on button tap |
| 7 | Wire mic input — 🎤 → STT → fills input box |
| 8 | Wire TTS output — 🔊 speaks result in correct voice |
| 9 | Save to Vocab — pushes pair into Ascend word bank |
| 10 | History — AsyncStorage last 20 translations |
| 11 | EAS build → TestFlight → App Store update |

**API:** MyMemory (free, no key, 1,000 req/day)
```
GET https://api.mymemory.translated.net/get?q=TEXT&langpair=en|fa
```
Upgrade to Google Translate when scaling past 1,000/day.

---

## Feature C — Speech-to-Text (Whisper)

**Vision:** Every iPhone owner speaks in any language Apple forgot — and it just works.
Apple STT fails on Farsi, Arabic, Turkish, minority languages. Whisper handles 99 languages with far superior accuracy. Merged into Ascend — same user base, same language list, one App Store listing.

**Plan:** TBD — specify after Feature A and B are underway.

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Standalone or inside Ascend? | Inside Ascend | One App Store listing, more value |
| Translation API | MyMemory → Google Translate | Free tier first, scale later |
| STT engine | OpenAI Whisper | 99 languages, beats Apple quality |
| Speech output | expo-speech (already in Ascend) | Reuse existing voice detection |
| History storage | AsyncStorage | Already in Expo |

---

## Files

| File | Location |
|------|----------|
| App.tsx | ~/Desktop/ascend/App.tsx |
| Feature spec | ~/Desktop/ASCEND_TRANSLATE_SPEC.md |
| App handoff | ~/Desktop/ascend/ASCEND_HANDOFF.md |
| Repo | github.com/shaz010/ascend |

---

## Corrections Log

| Date | What |
|------|------|
| 2026-10-05 | LEARNED WORDS: two separate tappable boxes per word (FA gold / EN muted), each speaks on tap. Confirmed on device. Commit 7a9720e |
| 2026-10-05 | Full vault rewrite — all v1.3 items confirmed on device, old pending items cleared, STT vision added as Feature C |
