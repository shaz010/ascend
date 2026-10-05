# Ascend — Session Handoff
Last updated: 2026-10-05 (session 1)

---

## App Identity
- **Name:** Ascend
- **Type:** Expo / React Native iOS language-learning app
- **Repo:** https://github.com/shaz010/ascend
- **File:** `App.tsx` (single file, ~829 lines)
- **Framework:** Expo SDK 57, React Native, TypeScript

---

## Languages & Scenarios
- **Languages:** Farsi, Spanish, French, Mandarin, Italian, Russian, Arabic, Turkish
- **Scenarios:** Business · Survival · Social

---

## App Flow
1. Language select screen
2. Scenario select screen
3. Convo screen — AI bubble → word breakdown → YOU SAID → YOUR RESPONSE buttons → Next →
4. Repeat with next exchange

---

## Architecture Notes
- Single `App.tsx` — no separate components
- `advanceRef` — ref to advance function, called by Next → button
- `chosen` state — tracks which response button was selected (empty string = nothing chosen)
- `!!chosen` guard used on YOU SAID section and Next → button (empty string = false, prevents silent React crash)
- Choice buttons OUTSIDE ScrollView — required for `onPress` to be scroll-safe
- `RTL_LANGS` set handles right-to-left layout (Farsi, Arabic)

---

## Current State (Oct 5, 2026)
- ✅ Blank screen below AI bubble — fixed (`!!chosen` guard)
- ✅ Choice buttons always visible — no longer inside `{chosen && ...}` conditional
- ✅ Both buttons respond freely — no `!chosen` lock, free re-selection
- ✅ Next → button functional — `onPress` + `advanceRef.current?.()`
- ✅ Buttons outside ScrollView — scroll can't accidentally trigger selection
- ✅ Committed: de06a95 · Pushed to main

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

---

## Edit Rules (non-negotiable)
- Edit `App.tsx` via `device_bash` + Python3 read/modify/write ONLY
- Path in device_bash: `os.path.expanduser('~') + '/mnt/Desktop/ascend/App.tsx'`
- Never use `device_commit_files`
- Verify every edit with grep BEFORE telling Shaz to build
- Git push requires Shaz's credentials — give Terminal commands, never push directly
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
- 2026-10-05 (session 1): Major bug fixes. Blank screen below AI bubble fixed (!!chosen). Choice buttons moved outside ScrollView, onPress, !chosen guard removed — both buttons freely selectable. Next → button fixed (onPress + advanceRef). Shaz confirmed: "Well done 👍". Committed de06a95, pushed to main.
