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
    files: ['src/**/*.{ts,tsx}'],
    extends: cheminfoReact,
  },
);
