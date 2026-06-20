# FIR Assistant

A React + Node web app that sends a cyber-crime complaint to an LLM API, classifies the complaint by meaning, and suggests Indian legal provisions that may help a police officer frame an FIR.

## Project Structure

- `src/` - React user interface.
- `server/` - Express API and LLM prompt orchestration.
- `server/legalKnowledge.js` - curated legal reference material supplied to the LLM.
- `.env.example` - environment variables needed by the server.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and add an LLM API key:

```bash
LLM_PROVIDER=gemini
LLM_API_KEY=your_google_ai_studio_api_key_here
LLM_MODEL=gemini-2.5-flash-lite
LLM_FALLBACK_MODELS=gemini-2.5-flash
LLM_TIMEOUT_MS=18000
PORT=3001
```

For Gemini, `LLM_API_KEY` can be a Google AI Studio API key. You can also name it `GEMINI_API_KEY`.
If the primary model is overloaded, the server tries `LLM_FALLBACK_MODELS` from left to right.

3. Start the app:

```bash
npm run dev
```

The React app runs on `http://127.0.0.1:5173` and the API runs on `http://127.0.0.1:3001`.

## Production Hosting

The project can be deployed as one Node web service on Render, Railway, or a similar host.

Use these service commands:

```text
Build command: npm install && npm run build
Start command: npm start
Health check: /api/health
```

Configure these environment variables in the hosting dashboard:

```text
NODE_ENV=production
LLM_PROVIDER=gemini
LLM_API_KEY=your_google_ai_studio_api_key
LLM_MODEL=gemini-2.5-flash-lite
LLM_FALLBACK_MODELS=gemini-2.5-flash
LLM_TIMEOUT_MS=18000
```

Do not upload the local `.env` file. The hosting platform supplies `PORT` automatically. In production, Express serves both the compiled React frontend and `/api` routes from the same domain.

## Notes

The app is a decision-support tool, not legal advice. It uses the LLM to interpret complaint meaning, while the server supplies a compact reference set of Information Technology Act, 2000 and Bharatiya Nyaya Sanhita, 2023 provisions relevant to common cyber-crime complaints.

Primary legal references used for the prompt context:

- Information Technology Act, 2000: `https://www.indiacode.nic.in/bitstream/123456789/13116/1/it_act_2000_updated.pdf`
- Bharatiya Nyaya Sanhita, 2023: `https://www.indiacode.nic.in/handle/123456789/20062`
- Ministry of Home Affairs BNS PDF: `https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf`
