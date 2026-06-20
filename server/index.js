import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legalKnowledge } from "./legalKnowledge.js";

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(currentDir, "..", "dist");

if (process.env.CLIENT_ORIGIN) {
  const allowedOrigins = process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim());
  app.use(cors({ origin: allowedOrigins }));
} else if (!isProduction) {
  app.use(cors({ origin: "http://127.0.0.1:5173" }));
}

app.use(express.json({ limit: "1mb" }));

const responseSchema = {
  responseLanguage: "English | Hindi",
  complaintSummary: "plain-language summary in 2-3 sentences",
  primaryCategory: "single best cyber-crime category",
  secondaryCategories: ["other possible categories"],
  severity: "Low | Medium | High | Critical",
  confidence: 0.82,
  suggestedSections: [
    {
      law: "Information Technology Act, 2000 or Bharatiya Nyaya Sanhita, 2023",
      section: "66D",
      title: "short section title",
      fitReason: "why this section fits the complaint facts",
      firUse: "Primary | Add-on | Verify"
    }
  ],
  missingFacts: ["facts needed before final FIR section selection"],
  evidenceChecklist: ["digital evidence or procedural material to collect"],
  immediateActions: ["practical next steps for police/intake officer"],
  caveats: ["short legal caution"]
};

const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    responseLanguage: { type: "STRING", enum: ["English", "Hindi"] },
    complaintSummary: { type: "STRING" },
    primaryCategory: { type: "STRING" },
    secondaryCategories: { type: "ARRAY", items: { type: "STRING" } },
    severity: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
    confidence: { type: "NUMBER" },
    suggestedSections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          law: { type: "STRING" },
          section: { type: "STRING" },
          title: { type: "STRING" },
          fitReason: { type: "STRING" },
          firUse: { type: "STRING", enum: ["Primary", "Add-on", "Verify"] }
        },
        required: ["law", "section", "title", "fitReason", "firUse"]
      }
    },
    missingFacts: { type: "ARRAY", items: { type: "STRING" } },
    evidenceChecklist: { type: "ARRAY", items: { type: "STRING" } },
    immediateActions: { type: "ARRAY", items: { type: "STRING" } },
    caveats: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: [
    "responseLanguage",
    "complaintSummary",
    "primaryCategory",
    "secondaryCategories",
    "severity",
    "confidence",
    "suggestedSections",
    "missingFacts",
    "evidenceChecklist",
    "immediateActions",
    "caveats"
  ]
};

const systemInstruction = [
  "You are an Indian cyber-crime complaint classification assistant for police intake.",
  "Classify the complaint by meaning, not by keyword matching.",
  "Suggest FIR-supporting sections only from the supplied legal reference.",
  "Do not claim to replace a lawyer, prosecutor, IO, SHO, magistrate, or court.",
  "If facts are insufficient, explain what is missing and mark sections as Verify.",
  "Use the required response language specified in the user prompt and set responseLanguage to that language.",
  "For Hindi output, write every descriptive response value in clear Hindi using Devanagari script. Keep statutory section numbers exact.",
  "Return strict JSON only. No markdown."
].join(" ");

function buildUserPrompt(complaint, requestedLanguage) {
  return `Legal reference:\n${legalKnowledge}\n\nJSON shape:\n${JSON.stringify(responseSchema, null, 2)}\n\nRequired response language: ${requestedLanguage}. Write all descriptive response values in this language.\nKeep each checklist concise with no more than 5 items.\n\nComplaint:\n${complaint}`;
}

function extractJson(text) {
  const trimmed = text.trim();
  const match = trimmed.startsWith("{") && trimmed.endsWith("}")
    ? [trimmed]
    : trimmed.match(/\{[\s\S]*\}/);

  if (!match) {
    const error = new Error("The AI response was not valid structured data. Please try again.");
    error.code = "MALFORMED_JSON";
    throw error;
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    const error = new Error("The AI returned incomplete structured data. Retrying with another model.");
    error.code = "MALFORMED_JSON";
    throw error;
  }
}

function validateComplaint(complaint) {
  if (typeof complaint !== "string") {
    return "Complaint must be text.";
  }

  const clean = complaint.trim();
  if (clean.length < 30) {
    return "Please enter at least 30 characters describing what happened.";
  }

  if (clean.length > 5000) {
    return "Please keep the complaint under 5000 characters.";
  }

  return null;
}

function getProvider(model) {
  const configuredProvider = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (configuredProvider) {
    return configuredProvider;
  }

  return model.toLowerCase().startsWith("gemini-") ? "gemini" : "openai";
}

function getApiKey(provider) {
  if (provider === "gemini") {
    return process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  }

  return process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
}

function requireApiKey(apiKey, provider) {
  if (!apiKey) {
    const keyName = provider === "gemini" ? "GEMINI_API_KEY or LLM_API_KEY" : "OPENAI_API_KEY or LLM_API_KEY";
    const error = new Error(`${keyName} is missing. Add it to .env before classifying complaints.`);
    error.status = 503;
    throw error;
  }
}

function getFallbackModels(provider, primaryModel) {
  const configuredFallbacks = process.env.LLM_FALLBACK_MODELS?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  const fallbackModels =
    configuredFallbacks ||
    (provider === "gemini" ? ["gemini-2.5-flash", "gemini-2.5-flash-lite"] : []);

  return [primaryModel, ...fallbackModels].filter(
    (model, index, models) => models.indexOf(model) === index
  );
}

function isRetryableLlmError(error) {
  const message = error.message?.toLowerCase() || "";
  return (
    error.status === 429 ||
    error.status === 503 ||
    error.status === 504 ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("rate limit") ||
    message.includes("quota") ||
    error.code === "MALFORMED_JSON" ||
    error.name === "TimeoutError"
  );
}

function getFetchSignal() {
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 18000);
  return AbortSignal.timeout(Math.max(5000, Math.min(timeoutMs, 45000)));
}

async function callOpenAi(complaint, requestedLanguage, model, apiKey) {
  const apiUrl = process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
  const messages = [
    {
      role: "system",
      content: systemInstruction
    },
    {
      role: "user",
      content: buildUserPrompt(complaint, requestedLanguage)
    }
  ];

  const response = await fetch(apiUrl, {
    method: "POST",
    signal: getFetchSignal(),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message || `LLM request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("The LLM response was empty.");
  }

  return extractJson(content);
}

async function callGemini(complaint, requestedLanguage, model, apiKey) {
  const apiUrl =
    process.env.GEMINI_API_URL ||
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(apiUrl, {
    method: "POST",
    signal: getFetchSignal(),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildUserPrompt(complaint, requestedLanguage) }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: geminiResponseSchema,
        temperature: 0.15,
        maxOutputTokens: 3200
      }
    })
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message || `Gemini request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const content = body?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");

  if (!content) {
    throw new Error("The Gemini response was empty.");
  }

  return extractJson(content);
}

async function callLlm(complaint, requestedLanguage) {
  const model = process.env.LLM_MODEL || "gpt-4.1-mini";
  const provider = getProvider(model);
  const apiKey = getApiKey(provider);

  requireApiKey(apiKey, provider);

  if (provider === "gemini") {
    const models = getFallbackModels(provider, model);
    const errors = [];

    for (const candidateModel of models) {
      try {
        const result = await callGemini(complaint, requestedLanguage, candidateModel, apiKey);
        return {
          ...result,
          modelUsed: candidateModel,
          fallbackUsed: candidateModel !== model
        };
      } catch (error) {
        errors.push(`${candidateModel}: ${error.message}`);

        if (!isRetryableLlmError(error)) {
          throw error;
        }
      }
    }

    const error = new Error(
      `All Gemini models are currently unavailable or rate-limited. Tried: ${errors.join(" | ")}`
    );
    error.status = 503;
    throw error;
  }

  if (provider === "openai") {
    const result = await callOpenAi(complaint, requestedLanguage, model, apiKey);
    return {
      ...result,
      modelUsed: model,
      fallbackUsed: false
    };
  }

  const error = new Error(`Unsupported LLM_PROVIDER "${provider}". Use "gemini" or "openai".`);
  error.status = 400;
  throw error;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/classify", async (req, res) => {
  const complaint = req.body?.complaint;
  const requestedLanguage = req.body?.language === "Hindi" ? "Hindi" : "English";
  const validationError = validateComplaint(complaint);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await callLlm(complaint.trim(), requestedLanguage);
    return res.json({
      ...result,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      return res.status(504).json({
        error: "The LLM request timed out. Check your API key, model access, and network connection."
      });
    }

    return res.status(error.status || 500).json({
      error: error.message || "Unable to classify complaint."
    });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API route not found." });
});

if (isProduction && !process.env.VERCEL) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (!process.env.VERCEL) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port} in ${isProduction ? "production" : "development"} mode`);
  });
}

export default app;
