/// <reference types="vite/client" />
import { mount } from 'svelte';
import App from '../components/App.svelte';

mount(App, { target: document.getElementById('app') as HTMLElement });

async function registerServiceWorker() {
  try {
    await navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js');
  } catch (err) {
    console.warn('[SW] Registration failed:', err);
  }
}

if ('serviceWorker' in navigator) {
  registerServiceWorker();
}
