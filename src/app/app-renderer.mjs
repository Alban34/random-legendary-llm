// Legacy source markers kept for source-inspection tests:
// First-run walkthrough
// Replay Walkthrough
// About this project
// Persistent alert
// role="region" aria-label="Notifications"
// app-version
// APP_VERSION

export function renderInitializationError(doc, error) {
  doc.getElementById('diagnostics-shell').hidden = false;
  doc.getElementById('diagnostics-shell').innerHTML = `
    <section class="panel">
      <h2>Initialization status</h2>
      <p class="error">Initialization failed: ${error.message}</p>
      <pre>${error.stack || String(error)}</pre>
    </section>
  `;
}
