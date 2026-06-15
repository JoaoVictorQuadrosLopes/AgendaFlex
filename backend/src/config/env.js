const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const isProduction = process.env.NODE_ENV === "production";

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

function validateSecret(name, value) {
  if (isProduction && value.length < 32) {
    throw new Error(`${name} precisa ter pelo menos 32 caracteres em producao`);
  }

  if (isProduction && /troque|secret|senha|password/i.test(value)) {
    throw new Error(`${name} parece ser um valor padrao. Configure um segredo real em producao.`);
  }
}

const DATABASE_URL = requireEnv("DATABASE_URL");
const JWT_SECRET = requireEnv("JWT_SECRET");
validateSecret("JWT_SECRET", JWT_SECRET);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5173";
const corsOrigins = Array.from(new Set([...splitList(process.env.CORS_ORIGINS), FRONTEND_URL].filter(Boolean)));

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),
  DATABASE_URL,
  JWT_SECRET,
  FRONTEND_URL,
  API_PUBLIC_URL: process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL || "",
  CORS_ORIGINS: corsOrigins,
  isProduction
};
