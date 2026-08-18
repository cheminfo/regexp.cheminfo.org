import { defineConfig, globalIgnores } from 'eslint/config';
import cheminfoReact from 'eslint-config-cheminfo-react';
import cheminfoTs from 'eslint-config-cheminfo-typescript';

export default defineConfig(
  globalIgnores([
    'coverage',
    'dist',
    'e2e',
    'playwright.config.ts',
    'playwright-report',
    'test-results',
  ]),
  ...cheminfoTs,
  {
    // A build step runs in node, and reads the address of the deployment from
    // the environment it was started in.
    files: ['scripts/**'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: cheminfoReact,
  },
);
