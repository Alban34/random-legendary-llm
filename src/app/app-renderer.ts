export function renderInitializationError(doc: Document, error: Error): void {
  const shell = doc.getElementById('diagnostics-shell');
  shell!.hidden = false;

  const section = doc.createElement('section');
  section.className = 'panel';

  const heading = doc.createElement('h2');
  heading.textContent = 'Initialization status';
  section.appendChild(heading);

  const para = doc.createElement('p');
  para.className = 'error';
  para.textContent = `Initialization failed: ${error.message}`;
  section.appendChild(para);

  const pre = doc.createElement('pre');
  pre.textContent = error.stack || String(error);
  section.appendChild(pre);

  shell!.appendChild(section);
}
