import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';

// Shared browser globals for all src/ files (used in both .mjs and .svelte contexts)
const BROWSER_GLOBALS = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  CustomEvent: 'readonly',
  Event: 'readonly',
  Element: 'readonly',
  HTMLElement: 'readonly',
  MutationObserver: 'readonly',
  ResizeObserver: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  performance: 'readonly',
  crypto: 'readonly',
  queueMicrotask: 'readonly',
  Blob: 'readonly',
  File: 'readonly',
  FileReader: 'readonly',
  FormData: 'readonly',
  AbortController: 'readonly',
  AbortSignal: 'readonly',
  structuredClone: 'readonly',
};

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: ['src/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: BROWSER_GLOBALS,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-useless-assignment': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-self-assign': 'error',
    },
  },
  {
    // Svelte components and Svelte 5 module scripts need browser globals and rune globals.
    // Disabled — all HTML is generated through escapeHtml-protected template functions, not from raw user input.
    files: ['src/**/*.svelte', 'src/**/*.svelte.js'],
    languageOptions: {
      globals: {
        ...BROWSER_GLOBALS,
        // Svelte 5 runes (compiler-injected globals)
        $state: 'readonly',
        $derived: 'readonly',
        $effect: 'readonly',
        $props: 'readonly',
        $bindable: 'readonly',
        $inspect: 'readonly',
        $host: 'readonly',
      },
    },
  },
];
