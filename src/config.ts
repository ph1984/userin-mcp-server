import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "..", ".env") });

export const config = {
  services: {
    segments: process.env.SEGMENTS_URL || "http://localhost:3055",
    platform: process.env.PLATFORM_URL || "https://api.upstore.ai",
    aiJourney: process.env.AI_JOURNEY_URL || "http://localhost:8090",
    integrations: process.env.INTEGRATIONS_URL || "http://localhost:3066",
    ingestion: process.env.INGESTION_URL || "http://localhost:3077",
    createflow: process.env.CREATEFLOW_URL || "http://localhost:4000",
    flowimager: process.env.FLOWIMAGER_URL || "http://localhost:4001",
  },
  auth: {
    internalSecret: process.env.INTERNAL_SECRET || "userin-internal-2024",
    apiSecret: process.env.API_SECRET || "userinsight_secret_key_2023",
    jwtSecret: process.env.JWT_SECRET || "userinsight_secret_key_2024",
    ingestionApiKey: process.env.INGESTION_API_KEY || "",
  },
};
