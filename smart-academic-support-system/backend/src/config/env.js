const DEVELOPMENT_JWT_SECRET = "dev-secret-change-me";
const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
];

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");

export const isProductionRuntime = () => process.env.NODE_ENV === "production";

export const getJwtSecret = () => process.env.JWT_SECRET || DEVELOPMENT_JWT_SECRET;

export const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  const origins = isProductionRuntime()
    ? configuredOrigins
    : [...configuredOrigins, ...LOCAL_ORIGINS];

  return new Set(origins);
};

export const validateEnv = () => {
  const errors = [];

  if (!process.env.MONGO_URI) {
    errors.push("MONGO_URI is required");
  }

  if (isProductionRuntime()) {
    const jwtSecret = process.env.JWT_SECRET || "";
    if (jwtSecret.length < 32 || jwtSecret === DEVELOPMENT_JWT_SECRET) {
      errors.push("JWT_SECRET must be a unique value at least 32 characters long");
    }

    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.size === 0) {
      errors.push("CLIENT_URL must contain at least one deployed frontend origin");
    }

    for (const origin of allowedOrigins) {
      try {
        const parsedOrigin = new URL(origin);
        if (parsedOrigin.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(parsedOrigin.hostname)) {
          errors.push("CLIENT_URL origins must be public HTTPS URLs in production");
          break;
        }
        if (parsedOrigin.origin !== origin) {
          errors.push("CLIENT_URL entries must be origins without paths, queries, or fragments");
          break;
        }
      } catch {
        errors.push("CLIENT_URL must contain valid URL origins");
        break;
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.join("; ")}`);
  }
};
