# Ascend — Session Handoff
Last updated: 2026-10-07 (session 5)

---

## App Identity
- **Name:** Ascend
- **Type:** Expo / React Native iOS language-learning app
- **Repo:** https://github.com/shaz010/ascend
- **File:** `App.tsx` (single file, ~1070 lines)
- **Framework:** Expo SDK 57, React Native, TypeScript


---

## 🎯 Ascend — Intentional Vision (locked Oct 6, 2026)

**Ascend is a language teacher. Not a translation app.**

Translation and STT are tools it uses to teach — not the product itself.

### The gap Ascend fills
- Duolingo ignores Persian entirely
- Google Translate doesn't teach anything
- Apple STT ignores Farsi, Arabic, Turkish, most minority languages
- No app exists that meets a heritage speaker IN their language and walks them OUT into English

### Who Ascend is for
Heritage speakers, immigrants, and diaspora communities whose mother tongue Apple forgot.
Primary beachhead: **Farsi speakers learning English** — then Arabic, Turkish, and beyond.

### The teaching loop (every feature serves this)
1. 🎙 **Speak** in your language (Whisper STT — Nov 1)
2. 📖 **See** it written + translated (what you said, what it means)
3. 🗣 **Practice** saying it in the target language (scenario conversations)
4. ✅ **Bank it** — Learned Words build your personal vocabulary

### North star sentence (do not change without Shaz confirming)
> *"Ascend teaches you English through your own language — speak Farsi, hear it back in English, practice until it sticks."*

### What Ascend is NOT
- Not a translation app (too many, all free, impossible to compete)
- Not a general-purpose language tool
- Not Duolingo (no gamification-first approach)

### App Store positioning
- **Category:** Education (NOT Utilities or Translation)
- **Competitor set:** Duolingo, Babbel — NOT Google Translate, DeepL
- **Differentiator:** The only language teacher that speaks YOUR language first
- **Write App Store copy AFTER Whisper STT is confirmed working (Nov 1)**

---

## ⛔ DEAD ENDS — DO NOT RETRY THESE (confirmed, ever)

**5+ days, 5+ sessions cycling the same failures. Future Claude: READ EVERY LINE BEFORE TOUCHING ANYTHING.**

### ❌ expo-speech-recognition for Farsi (tried sessions 3 AND 5 — BOTH failed, SAME error)
- **Session 3:** removed because "iOS ignores lang param for Farsi, transcribes as English"
- **Session 5:** re-added with `fa-IR` BCP-47 code claiming "may work differently" — it did not. Same result: `SR error: language-not-supported`
- **Root cause:** iOS Speech Recognition framework does NOT support Farsi (fa-IR). This is an Apple platform limitation. It will not be fixed by changing language codes, re-adding the package, or any JS change.
- **DO NOT retry this. Ever. Not with fa-IR, fa, fa-AF, or any variant. Dead.**

### ❌ expo-audio + Whisper (tried sessions 3, 4, 5 — all failed)
- **Error:** "The audio file could not be decoded or its format is not supported"
- **Root cause 1:** `RecordingPresets.HIGH_QUALITY` nests `outputFormat: 'aac '` under `ios:{}` — Swift `RecordingOptions` struct is FLAT, never sees it → `AVFormatIDKey` never set → malformed M4A
- **Root cause 2:** Even with FLAT_M4A_OPTIONS, `AudioUtils.swift` stores `Optional<UInt32>` in `[String: Any]` → bridges to ObjC as opaque `_SwiftValue` → AVAudioRecorder silently ignores `AVFormatIDKey` → malformed M4A regardless
- **Fix written:** AudioUtils.swift patch (unwrap Optional<UInt32>, exclude LPCM keys) — this IS the correct fix
- **Why it can't deploy:** requires native rebuild (`npx expo run:ios --device`) — this hangs indefinitely on Shaz's machine
- **DO NOT attempt expo-audio + Whisper again until the rebuild hanging is solved first.**

### ❌ Metro hot-reload as a substitute for native rebuild
- Metro hot-reload = JavaScript/TypeScript changes ONLY
- Swift changes in `node_modules/expo-audio/ios/` require Xcode compilation
- Suggesting "hot-reload the patch" is wrong. It cannot work. Stop suggesting it.

### ❌ The back-and-forth cycle (the core waste pattern)
- Sessions 3→4→5 pattern: try expo-speech-recognition → fails → try expo-audio+Whisper → fails → try expo-speech-recognition again → fails → repeat
- Each switch wasted a full session and Shaz's time
- **Rule:** Do not switch approaches without (a) documenting the exact root cause of the current failure here, and (b) Shaz explicitly saying to try something else.

---

## ✅ ONLY REMAINING PATHS (as of Oct 7, 2026)

**The mic voice pipeline for Farsi has exactly two possible solutions. There are no others.**

### Path A: Fix the local rebuild hang → compile AudioUtils.swift patch → Whisper works
- The AudioUtils.swift patch is already written and correct (`node_modules/expo-audio/ios/AudioUtils.swift`)
- Problem: `npx expo run:ios --device` hangs indefinitely
- Possible causes: Xcode signing issue, device not trusted, pod install incomplete, network timeout during build
- Next session FIRST: diagnose why the build hangs before writing any code
- Commands to try: `cd ~/Desktop/ascend/ios && xcodebuild -workspace ascend.xcworkspace -scheme ascend -destination 'id=<device-id>' build 2>&1 | tail -50` to see actual error

### Path B: EAS cloud build (bypasses local Xcode entirely)
- EAS Build runs on Expo's cloud servers, compiles native code there, delivers .ipa to Shaz's device
- `eas.json` already exists in the repo (added session 4)
- Command: `cd ~/Desktop/ascend && npx eas-cli build --platform ios --profile development`
- Requires: Expo account login (`npx eas-cli login`), valid Apple credentials in EAS
- This would compile the AudioUtils.swift patch without touching local Xcode
- **This is the most promising path if local rebuild keeps hanging**

### ⛔ Not a path: any JS-only approach for Farsi voice
- iOS does not support Farsi speech recognition
- No JS package can fix an Apple platform limitation
- Do not try another JS speech package

---

---

## Languages & Scenarios
- **Languages:** 24 — EN, FA, ES, FR, ZH, IT, RU, AR, TR, DE, JA, KO, HI, PT, NL, PL, SV, HE, UR, VI, ID, BN, UK, EL
- **Scenarios:** Business · Survival · Social

---

## App Flow
1. Language select screen
2. Scenario select screen
3. Convo screen — AI bubble → word breakdown → YOU SAID → YOUR RESPONSE buttons → Next →
4. Repeat with next exchange
5. 🌐 Translate button on Splash (bottom-right) → Translate screen

---

## Architecture Notes
- Single `App.tsx` — no separate components
- `advanceRef` — ref to advance function, called by Next → button
- `chosen` state — tracks which response button was selected (empty string = nothing chosen)
- `!!chosen` guard used on YOU SAID section and Next → button (empty string = false, prevents silent React crash)
- Choice buttons OUTSIDE ScrollView — required for `onPress` to be scroll-safe
- `RTL_LANGS` set handles right-to-left layout (Farsi, Arabic)

---

## Current State (Oct 7, 2026)
- ✅ Blank screen below AI bubble — fixed (`!!chosen` guard)
- ✅ Choice buttons always visible — no longer inside `{chosen && ...}` conditional
- ✅ Both buttons respond freely — no `!chosen` lock, free re-selection
- ✅ Next → button functional — `onPress` + `advanceRef.current?.()`
- ✅ Buttons outside ScrollView — scroll can't accidentally trigger selection
- ✅ LEARNED WORDS: two separate boxes FA/EN, each independently tappable, speaks on touch
- ✅ TRANSLATE SCREEN: 24 languages, modal grid picker, Google Translate API, TTS output, RTL support, auto-translate on keyboard dismiss · Committed: 2dff6e0
- ✅ VOICE PIPELINE REBUILT (Oct 7): Switched from expo-audio + Whisper to expo-speech-recognition. `startRecording` → `ExpoSpeechRecognitionModule.requestPermissionsAsync()` + `.start({lang: SR_LANG[trSourceLang]})`. `stopAndTranscribe` → `.stop()`. Result/translation handled by `result` event listener (isFinal). No rebuild required — already compiled in installed app (confirmed Pods.xcodeproj).

---

## Key Code Locations (App.tsx)
| What | Where |
|------|-------|
| `advanceRef` declaration | ~L308 |
| `chosen` state | ~L290 |
| ScrollView (convo screen) | ~L553 — no scroll callbacks |
| YOU SAID section | ~L693 — `{!!chosen && ...}` |
| Choice buttons (outside ScrollView) | ~L716 — `onPress={() => { handleChoice(ch.t); }}` |
| Next → button (outside ScrollView) | ~L725 — `{!!chosen && ...}` + `onPress` |
| LEARNED WORDS chips | ~L688 — two Pressable boxes per word (FA gold / EN muted), each speaks on tap |
| Translate button (Splash) | ~L454 — bottom-right gold chip, navigates to 'translate' screen |
| ALL_LANGS array | ~L18 — 24 language codes |
| LANG_LABELS map | ~L19 — display names for 24 languages |
| LANG_VOICE map | ~L23 — TTS locale codes for all 24 languages |
| RTL_LANGS set | ~L28 — {fa, ar, he, ur} |
| Translate state vars | ~L292-304 — trSourceLang, trTargetLang, trInput, trOutput, trLoading, trPickerFor |
| doTranslate() | ~L305 — Google Translate unofficial endpoint, async fetch |
| SR_LANG mapping | ~L43 — BCP-47 codes: fa→fa-IR, es→es-ES, fr→fr-FR, etc. |
| FLAT_M4A_OPTIONS | ~L47 — flat recording options (Swift struct compat, unused now) |
| srSubsRef | ~L351 — holds expo-speech-recognition event subscriptions for cleanup |
| startRecording() | ~L353 — uses ExpoSpeechRecognitionModule (no rebuild needed) |
| stopAndTranscribe() | ~L412 — calls .stop(), result arrives via 'result' event |
| Language picker modal | ~line 793 — FROM/TO buttons + modal grid, 30%-width tiles |

---

## Edit Rules (non-negotiable)
- Edit `App.tsx` via `device_bash` + Python3 read/modify/write ONLY
- Path in device_bash: `os.path.expanduser('~') + '/mnt/Desktop/ascend/App.tsx'`
- Never use `device_commit_files`
- Verify every edit with grep BEFORE telling Shaz to build
- Git push requires Shaz's credentials — give Terminal commands, never push directly
- To add a new file to the repo: `cp ~/Desktop/FILENAME ~/Desktop/ascend/FILENAME && cd ~/Desktop/ascend && git add FILENAME && git commit -m "..." && git push origin main`
- NEVER drag files into GitHub website — always Terminal commands
- NEVER paste file content cards into Terminal — file cards are for GitHub website editor only
- Never redesign/resize/recolor any visual without explicit instruction
- Never delete files without calm confirmation

---

## Build & Run
\`\`\`bash
cd ~/Desktop/ascend && npx expo start --clear
\`\`\`

---

## Git
- Remote: https://github.com/shaz010/ascend.git
- Push: `cd ~/Desktop/ascend && git push origin main`

---

## Session Log
- 2026-10-07 (session 5): VOICE PIPELINE REBUILT. Extensive debugging of expo-audio + Whisper pipeline (4+ days). Root cause: Swift `RecordingOptions` struct is FLAT — `RecordingPresets.HIGH_QUALITY.ios.outputFormat` never reaches it; also `Optional<UInt32>` bridges to ObjC as opaque `_SwiftValue`, so `AVFormatIDKey` is ignored → malformed M4A → Whisper "could not be decoded." AudioUtils.swift patch written (unwrap Optional<UInt32>, exclude LPCM encoder keys) but native rebuild kept hanging. Solution: switched to `expo-speech-recognition` (already compiled in installed app via Pods.xcodeproj). Added SR_LANG BCP-47 map, replaced startRecording/stopAndTranscribe with ExpoSpeechRecognitionModule event-driven pipeline. Hot-reload via Metro tunnel — no rebuild needed. **Shaz to test: tap mic → speak Farsi → iOS transcribes → auto-translates to English.**
- 2026-10-06 (session 3): TRANSLATE SCREEN built. Added TextInput import, expanded to 24 languages, fixed URL-encoded output (switched to Google Translate endpoint), fixed default target lang (FA→EN), added all TTS voice codes including 'en-US', replaced horizontal chip scroll with modal grid picker, RTL text direction for FA/AR/HE/UR, auto-translate on keyboard dismiss (onBlur). Attempted expo-speech-recognition for custom mic — removed: iOS ignores lang param for Farsi, transcribes as English. Workaround: iOS keyboard native mic + dismiss to translate. STT solution: Whisper API (Nov 1). Committed 2dff6e0, pushed to main.
- 2026-10-05 (session 2): LEARNED WORDS upgraded — each word now shows two separate tappable boxes (FA gold on top, EN muted below). Tap FA box → speaks FA. Tap EN box → speaks EN. Confirmed working on device. Committed 7a9720e.
- 2026-10-05 (session 1): Major bug fixes. Blank screen below AI bubble fixed (!!chosen). Choice buttons moved outside ScrollView, onPress, !chosen guard removed — both buttons freely selectable. Next → button fixed (onPress + advanceRef). Shaz confirmed: "Well done 👍". Committed de06a95, pushed to main.

---

## Next Session
- Test voice pipeline: tap mic → speak Farsi → confirm transcription appears → confirm English translation appears
- If expo-speech-recognition Farsi transcription works → ✅ pipeline done
- If Farsi still transcribes as English on device: fall back to Whisper API (OpenAI key already in App.tsx L39)
  - Record with expo-audio FLAT_M4A_OPTIONS (already defined), POST to Whisper, but requires native rebuild for AudioUtils.swift patch
- Clean up unused imports (expo-audio, FileSystem) once voice confirmed working
