import { createEpic1Bundle } from './game-data-pipeline.mjs';
import { renderBundle, renderInitializationError } from './app-renderer.mjs';

async function loadSeed() {
  const seedUrl = new URL('../data/canonical-game-data.json', import.meta.url);
  const response = await fetch(seedUrl);
  if (!response.ok) {
    throw new Error(`Unable to load canonical game data (${response.status} ${response.statusText})`);
  }
  return response.json();
}

async function boot() {
  const seed = await loadSeed();
  const bundle = createEpic1Bundle(seed);
  window.__EPIC1 = bundle;
  renderBundle(document, bundle);
}

boot().catch((error) => {
  console.error(error);
  window.__EPIC1_ERROR__ = error;
  renderInitializationError(document, error);
});

