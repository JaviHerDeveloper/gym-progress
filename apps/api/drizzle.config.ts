import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

import { defineConfig } from 'drizzle-kit';

const externallyProvidedDatabaseUrl = process.env.DATABASE_URL;

if (existsSync('.env')) {
  loadEnvFile('.env');
}

if (externallyProvidedDatabaseUrl !== undefined) {
  process.env.DATABASE_URL = externallyProvidedDatabaseUrl;
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
