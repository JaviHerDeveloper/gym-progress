import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

export function loadRuntimeEnvironment(): void {
  const externallyProvidedValues = {
    DATABASE_URL: process.env.DATABASE_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    NODE_ENV: process.env.NODE_ENV,
  };

  if (existsSync('.env')) {
    loadEnvFile('.env');
  }

  for (const [name, value] of Object.entries(externallyProvidedValues)) {
    if (value !== undefined) {
      process.env[name] = value;
    }
  }
}
