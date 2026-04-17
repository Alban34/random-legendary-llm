import { mount } from 'svelte';
import App from '../components/App.svelte';

mount(App, { target: document.getElementById('app') });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js');
}
