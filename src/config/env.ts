const requiredEnvVars = ["NODE_ENV", "PORT"] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: environment variable ${envVar} is not set`); // eslint-disable-line no-console
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "3001", 10),
  API_PREFIX: process.env.API_PREFIX ?? "/api/v1",
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  DB_HOST: process.env.DB_HOST,
  DB_URL: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST ?? "localhost"}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME}`,
} as const;
