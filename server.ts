import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API health
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "AquaSentinel Ocean Intelligence Engine",
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Server-side Sonar Intelligence Analysis Endpoint
  app.post("/api/analyze-sonar", async (req, res) => {
    try {
      const { imageBase64, mimeType, surveyRegion, userMetadata } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 payload" });
      }

      // If GEMINI_API_KEY is configured, we can use Gemini 3.8 Flash to enhance acoustic feature reasoning
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
          const prompt = `You are the AquaSentinel Expert Marine Sonar Analyst. Analyze this side-scan or sector-scan acoustic sonar image.
Classify the prominent feature into one of these strict categories:
- Shipwreck
- Aircraft Wreck
- Human Remains / Possible Human Form (use this exact scientifically cautious phrasing if prone recumbent form with limb highlights and acoustic shadow is observed)
- Coral Reef
- Metallic Pipe
- Ghost Net
- Rock Formation
- Sand Ridge
- Seafloor Depression
- Debris Cluster
- Unknown Anomaly

Rules:
1. Do not use Ghost Net or Unknown as a default fallback. Classify based on actual acoustic backscatter, specular reflection, and acoustic shadow geometry.
2. Return a strict JSON response only with no markdown backticks, following this structure:
{
  "classification": string,
  "category": "Natural" | "Artificial" | "Anomalous" | "Unknown",
  "confidence": number (between 70 and 99),
  "referenceSimilarity": { "matchedReference": string, "similarityPercent": number },
  "acousticEvidence": [string, string, string],
  "geometry": { "shape": string, "aspectRatio": string, "shadowPattern": string },
  "dimensions": { "lengthMeters": number, "widthMeters": number, "estimatedHeightMeters": number },
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "ecologicalImpactSummary": string,
  "diverSafetySummary": string,
  "recommendedAction": string,
  "aiDetectionRationale": [string, string, string]
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || "image/png",
                    data: cleanBase64,
                  },
                },
                { text: prompt },
              ],
            },
          });

          const text = response.text || "";
          // Parse JSON safely
          const cleanJson = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          return res.json({
            success: true,
            source: "AI_GEMINI_ASSISTED",
            analysis: parsed,
          });
        } catch (geminiErr: any) {
          console.warn("Gemini API call failed or timed out, falling back to deterministic acoustic computer vision engine:", geminiErr?.message);
        }
      }

      // Fallback or default deterministic response if Gemini is unavailable
      return res.json({
        success: true,
        source: "ACOUSTIC_CV_FALLBACK",
        message: "Server received image. Client-side deterministic acoustic pipeline will process visual features.",
      });
    } catch (err: any) {
      console.error("Error in /api/analyze-sonar:", err);
      res.status(500).json({ error: "Failed to process sonar image analysis" });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AquaSentinel Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
