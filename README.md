# Articulate: earlier AI Studio prototype

An earlier React and TypeScript version of the communication-practice application. Components separate scenario selection, profile setup, practice, and feedback. `services/geminiService.ts` implements the model calls.

AI Studio project: https://ai.studio/apps/drive/1LDsX57itQZBzmLC7_Cy4F3dkgMsFra-p

Use `npm install` and `npm run dev` for local inspection. The original Vite configuration substitutes `GEMINI_API_KEY` into browser code. Do not use a private production credential or deploy that build with one. A public deployment needs a server-side model proxy and appropriate request controls.

The newer browser/backend project is https://github.com/1SonOfGlory/Griot-Labs-Articulate-AI. This repository is retained as a prototype; no learning-effectiveness or model-quality evaluation is claimed.
