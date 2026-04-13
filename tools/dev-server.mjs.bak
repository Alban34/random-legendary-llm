import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function parsePort(argv, envPort) {
  const portFlagIndex = argv.findIndex((arg) => arg === '--port' || arg === '-p');
  const portValue = portFlagIndex >= 0 ? argv[portFlagIndex + 1] : argv[0] || envPort || '8000';
  const port = Number.parseInt(portValue, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid port: ${portValue}`);
  }
  return port;
}

function getFilePathFromRequest(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidatePath = path.resolve(rootDir, relativePath);

  if (!candidatePath.startsWith(rootDir + path.sep) && candidatePath !== path.join(rootDir, 'index.html')) {
    return null;
  }

  return candidatePath;
}

async function resolveRequestFile(urlPath) {
  const candidatePath = getFilePathFromRequest(urlPath);
  if (!candidatePath) {
    return null;
  }

  try {
    const stats = await fs.stat(candidatePath);
    if (stats.isDirectory()) {
      return path.join(candidatePath, 'index.html');
    }
    return candidatePath;
  } catch {
    const pathname = decodeURIComponent(urlPath.split('?')[0]);
    const hasExtension = path.extname(pathname) !== '';
    if (!hasExtension) {
      return path.join(rootDir, 'index.html');
    }
    return null;
  }
}

function writeHeaders(response, statusCode, filePath) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store, max-age=0',
    'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff'
  });
}

async function handleRequest(request, response) {
  if (!request.url) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad Request');
    return;
  }

  if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
    response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Method Not Allowed');
    return;
  }

  const filePath = await resolveRequestFile(request.url);
  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    writeHeaders(response, 200, filePath);
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    response.end(content);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
      return;
    }
    console.error(error);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
  }
}

const port = parsePort(process.argv.slice(2), process.env.PORT);
const host = process.env.HOST || '127.0.0.1';

const server = http.createServer((request, response) => {
  handleRequest(request, response);
});

server.listen(port, host, () => {
  console.log(`Dev server running at http://${host}:${port}/`);
  console.log(`Serving ${rootDir}`);
});

