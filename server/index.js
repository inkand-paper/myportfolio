/**
 * Portfolio Backend Server
 * Pure Node.js — zero npm dependencies
 * Uses: http, fs, path, crypto, url (all built-in)
 * Data stored in server/data/db.json
 * Uploads stored in server/uploads/
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

// ── Config ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_secret_change_in_production_2025';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'portfolio2025';

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── Database (JSON file) ─────────────────────────────────
const DEFAULT_DB = {
  profile: {
    name: 'Your Name',
    title: 'Full-stack Developer & UI/UX Designer',
    bio: 'I am a full-stack developer and UI/UX designer with a deep interest in the intersection of engineering precision and visual craft.',
    bio2: 'Every project begins with understanding the problem, then designing backwards from the user.',
    location: 'Dhaka, BD',
    email: 'hello@inkandpaper.dev',
    github: 'https://github.com/inkand-paper',
    linkedin: 'https://linkedin.com',
    available: true,
    photo: null,
    eyebrow: 'Available for work',
    heroLine1: 'Crafting',
    heroLine2: 'digital',
    heroLine3: 'experiences.',
    heroBrief: 'Full-stack developer and UI/UX designer focused on precision, performance, and meaningful interaction.',
    statProjects: 40,
    statYears: 5,
    statSatisfaction: 98
  },
  projects: [
    {
      id: 'proj_1',
      number: '01',
      title: 'Nexus — Analytics Platform',
      category: 'SaaS · Web App',
      year: '2024',
      description: 'A real-time analytics dashboard for e-commerce brands. Custom chart system, live data streams, and a design system built from scratch.',
      tech: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
      link: '#',
      image: null,
      order: 1
    },
    {
      id: 'proj_2',
      number: '02',
      title: 'Forma — Finance Tracker',
      category: 'Mobile · iOS & Android',
      year: '2024',
      description: 'A minimalist personal finance app with intelligent categorization, budgeting tools, and micro-animations that make data feel tactile.',
      tech: ['React Native', 'Expo', 'Supabase'],
      link: '#',
      image: null,
      order: 2
    },
    {
      id: 'proj_3',
      number: '03',
      title: 'Arche — Fashion Brand',
      category: 'E-commerce · Web',
      year: '2023',
      description: 'High-end fashion brand storefront with 3D product previews, immersive scroll storytelling, and a conversion-optimized checkout.',
      tech: ['Next.js', 'Three.js', 'Shopify', 'GSAP'],
      link: '#',
      image: null,
      order: 3
    },
    {
      id: 'proj_4',
      number: '04',
      title: 'Relay — API Gateway',
      category: 'Dev Tool · B2B',
      year: '2023',
      description: 'Developer-facing API gateway with visual request builder, real-time logs, and team collaboration tools.',
      tech: ['Vue 3', 'FastAPI', 'Redis', 'Docker'],
      link: '#',
      image: null,
      order: 4
    }
  ],
  skills: [
    {
      id: 'skill_1',
      icon: 'grid',
      title: 'UI / UX Design',
      description: 'Design systems, prototyping, user research, wireframing, and Figma component libraries.',
      items: ['Figma & FigJam', 'Design systems', 'User research', 'Accessibility audit'],
      order: 1
    },
    {
      id: 'skill_2',
      icon: 'code',
      title: 'Frontend Dev',
      description: 'Pixel-precise implementation, component architecture, animation, and performance optimization.',
      items: ['React / Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion / GSAP'],
      order: 2
    },
    {
      id: 'skill_3',
      icon: 'database',
      title: 'Backend & Systems',
      description: 'Scalable API architecture, database modeling, authentication, and cloud infrastructure.',
      items: ['Node.js / Python', 'PostgreSQL / Redis', 'REST & GraphQL', 'AWS / Vercel / Docker'],
      order: 3
    },
    {
      id: 'skill_4',
      icon: 'layers',
      title: 'Motion & Interaction',
      description: 'Purposeful animation systems, scroll-driven effects, and interaction design.',
      items: ['GSAP / Lenis', 'CSS animations', 'Scroll storytelling', 'Micro-interactions'],
      order: 4
    }
  ],
  testimonial: {
    quote: 'The attention to detail and the ability to translate our vision into a product that genuinely delights users — it is rare. Every interaction feels considered.',
    author: 'Sarah Chen',
    role: 'CPO, Nexus Analytics'
  },
  tags: ['Problem solver', 'System thinker', 'Detail obsessed', 'Open source contributor']
};

function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DB));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  writeDB(DEFAULT_DB);
}

// ── JWT (pure crypto) ────────────────────────────────────
function base64url(buf) {
  return buf.toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJWT(payload) {
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64url(Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 24 * 3600 * 1000 })));
  const sig = base64url(crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest());
  return `${header}.${body}.${sig}`;
}

function verifyJWT(token) {
  try {
    const [header, body, sig] = token.split('.');
    const expected = base64url(crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest());
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) { return null; }
}

function hashPassword(pass) {
  return crypto.createHmac('sha256', JWT_SECRET).update(pass).digest('hex');
}

// ── Multipart parser (for file uploads) ─────────────────
function parseMultipart(body, boundary) {
  const parts = {};
  const boundaryBuf = Buffer.from('--' + boundary);
  let pos = 0;
  const bodyBuf = Buffer.isBuffer(body) ? body : Buffer.from(body);

  while (pos < bodyBuf.length) {
    const boundaryIdx = bodyBuf.indexOf(boundaryBuf, pos);
    if (boundaryIdx === -1) break;
    pos = boundaryIdx + boundaryBuf.length;
    if (bodyBuf[pos] === 45 && bodyBuf[pos + 1] === 45) break; // --

    // Skip \r\n after boundary
    if (bodyBuf[pos] === 13) pos += 2;

    // Read headers
    let headerEnd = bodyBuf.indexOf('\r\n\r\n', pos);
    if (headerEnd === -1) break;
    const headerStr = bodyBuf.slice(pos, headerEnd).toString();
    pos = headerEnd + 4;

    // Find next boundary
    const nextBoundary = bodyBuf.indexOf(boundaryBuf, pos);
    const partEnd = nextBoundary === -1 ? bodyBuf.length : nextBoundary - 2; // -2 for \r\n

    const partData = bodyBuf.slice(pos, partEnd);
    pos = nextBoundary;

    // Parse Content-Disposition
    const cdMatch = headerStr.match(/Content-Disposition:[^\r\n]*name="([^"]+)"/i);
    const fileMatch = headerStr.match(/filename="([^"]+)"/i);
    const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

    if (cdMatch) {
      const name = cdMatch[1];
      if (fileMatch) {
        parts[name] = {
          filename: fileMatch[1],
          contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream',
          data: partData
        };
      } else {
        parts[name] = partData.toString();
      }
    }
  }
  return parts;
}

// ── MIME types ───────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// ── Helpers ──────────────────────────────────────────────
function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(body);
}

function getAuthToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function requireAuth(req, res) {
  const token = getAuthToken(req);
  if (!token) { json(res, 401, { error: 'Unauthorized' }); return null; }
  const payload = verifyJWT(token);
  if (!payload) { json(res, 401, { error: 'Invalid or expired token' }); return null; }
  return payload;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function generateId(prefix) {
  return prefix + '_' + crypto.randomBytes(4).toString('hex');
}

// ── Router ───────────────────────────────────────────────
async function handleRequest(req, res) {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ── Public API ─────────────────────────────────────────
  if (pathname === '/api/portfolio' && method === 'GET') {
    return json(res, 200, readDB());
  }

  // ── Auth ───────────────────────────────────────────────
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await readBody(req);
    let data;
    try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }

    if (data.username === ADMIN_USER && hashPassword(data.password) === hashPassword(ADMIN_PASS)) {
      const token = signJWT({ username: data.username, role: 'admin' });
      return json(res, 200, { token, username: data.username });
    }
    return json(res, 401, { error: 'Invalid credentials' });
  }

  // ── Protected: Profile ────────────────────────────────
  if (pathname === '/api/admin/profile') {
    if (!requireAuth(req, res)) return;

    if (method === 'GET') {
      const db = readDB();
      return json(res, 200, db.profile);
    }

    if (method === 'PUT') {
      const body = await readBody(req);
      let data;
      try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      const db = readDB();
      db.profile = { ...db.profile, ...data };
      writeDB(db);
      return json(res, 200, db.profile);
    }
  }

  // ── Protected: Photo upload ───────────────────────────
  if (pathname === '/api/admin/upload-photo' && method === 'POST') {
    if (!requireAuth(req, res)) return;

    const ct = req.headers['content-type'] || '';
    const boundaryMatch = ct.match(/boundary=(.+)$/);
    if (!boundaryMatch) return json(res, 400, { error: 'No boundary' });

    const body = await readBody(req);
    const parts = parseMultipart(body, boundaryMatch[1]);
    const file = parts['photo'];

    if (!file || !file.data) return json(res, 400, { error: 'No file uploaded' });

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.contentType)) return json(res, 400, { error: 'Only images allowed' });

    // Max 5MB
    if (file.data.length > 5 * 1024 * 1024) return json(res, 400, { error: 'File too large (max 5MB)' });

    const ext = path.extname(file.filename) || '.jpg';
    const filename = 'photo_' + Date.now() + ext;
    const savePath = path.join(UPLOADS_DIR, filename);

    // Remove old photo
    const db = readDB();
    if (db.profile.photo) {
      const old = path.join(UPLOADS_DIR, path.basename(db.profile.photo));
      try { fs.unlinkSync(old); } catch (e) {}
    }

    fs.writeFileSync(savePath, file.data);
    db.profile.photo = '/uploads/' + filename;
    writeDB(db);
    return json(res, 200, { url: '/uploads/' + filename });
  }

  // ── Protected: Project image upload ───────────────────
  if (pathname === '/api/admin/upload-project-image' && method === 'POST') {
    if (!requireAuth(req, res)) return;

    const ct = req.headers['content-type'] || '';
    const boundaryMatch = ct.match(/boundary=(.+)$/);
    if (!boundaryMatch) return json(res, 400, { error: 'No boundary' });

    const body = await readBody(req);
    const parts = parseMultipart(body, boundaryMatch[1]);
    const file = parts['image'];

    if (!file || !file.data) return json(res, 400, { error: 'No file' });

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.contentType)) return json(res, 400, { error: 'Only images allowed' });
    if (file.data.length > 10 * 1024 * 1024) return json(res, 400, { error: 'File too large (max 10MB)' });

    const ext = path.extname(file.filename) || '.jpg';
    const filename = 'proj_' + Date.now() + ext;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.data);
    return json(res, 200, { url: '/uploads/' + filename });
  }

  // ── Protected: Projects ───────────────────────────────
  if (pathname === '/api/admin/projects') {
    if (!requireAuth(req, res)) return;

    if (method === 'GET') {
      return json(res, 200, readDB().projects);
    }

    if (method === 'POST') {
      const body = await readBody(req);
      let data;
      try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      const db = readDB();
      const project = {
        id: generateId('proj'),
        number: String(db.projects.length + 1).padStart(2, '0'),
        title: data.title || 'Untitled Project',
        category: data.category || '',
        year: data.year || new Date().getFullYear().toString(),
        description: data.description || '',
        tech: Array.isArray(data.tech) ? data.tech : (data.tech || '').split(',').map(t => t.trim()).filter(Boolean),
        link: data.link || '#',
        image: data.image || null,
        order: db.projects.length + 1
      };
      db.projects.push(project);
      writeDB(db);
      return json(res, 201, project);
    }
  }

  // /api/admin/projects/:id
  const projMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)$/);
  if (projMatch) {
    if (!requireAuth(req, res)) return;
    const id = projMatch[1];

    if (method === 'PUT') {
      const body = await readBody(req);
      let data;
      try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      const db = readDB();
      const idx = db.projects.findIndex(p => p.id === id);
      if (idx === -1) return json(res, 404, { error: 'Not found' });
      if (data.tech && typeof data.tech === 'string') {
        data.tech = data.tech.split(',').map(t => t.trim()).filter(Boolean);
      }
      db.projects[idx] = { ...db.projects[idx], ...data };
      writeDB(db);
      return json(res, 200, db.projects[idx]);
    }

    if (method === 'DELETE') {
      const db = readDB();
      const idx = db.projects.findIndex(p => p.id === id);
      if (idx === -1) return json(res, 404, { error: 'Not found' });
      db.projects.splice(idx, 1);
      // Renumber
      db.projects.forEach((p, i) => { p.order = i + 1; p.number = String(i + 1).padStart(2, '0'); });
      writeDB(db);
      return json(res, 200, { success: true });
    }
  }

  // ── Protected: Skills ─────────────────────────────────
  if (pathname === '/api/admin/skills') {
    if (!requireAuth(req, res)) return;

    if (method === 'GET') return json(res, 200, readDB().skills);

    if (method === 'POST') {
      const body = await readBody(req);
      let data;
      try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      const db = readDB();
      const skill = {
        id: generateId('skill'),
        icon: data.icon || 'grid',
        title: data.title || 'New Skill',
        description: data.description || '',
        items: Array.isArray(data.items) ? data.items : (data.items || '').split('\n').map(t => t.trim()).filter(Boolean),
        order: db.skills.length + 1
      };
      db.skills.push(skill);
      writeDB(db);
      return json(res, 201, skill);
    }
  }

  const skillMatch = pathname.match(/^\/api\/admin\/skills\/([^/]+)$/);
  if (skillMatch) {
    if (!requireAuth(req, res)) return;
    const id = skillMatch[1];

    if (method === 'PUT') {
      const body = await readBody(req);
      let data;
      try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      const db = readDB();
      const idx = db.skills.findIndex(s => s.id === id);
      if (idx === -1) return json(res, 404, { error: 'Not found' });
      if (data.items && typeof data.items === 'string') {
        data.items = data.items.split('\n').map(t => t.trim()).filter(Boolean);
      }
      db.skills[idx] = { ...db.skills[idx], ...data };
      writeDB(db);
      return json(res, 200, db.skills[idx]);
    }

    if (method === 'DELETE') {
      const db = readDB();
      const idx = db.skills.findIndex(s => s.id === id);
      if (idx === -1) return json(res, 404, { error: 'Not found' });
      db.skills.splice(idx, 1);
      db.skills.forEach((s, i) => { s.order = i + 1; });
      writeDB(db);
      return json(res, 200, { success: true });
    }
  }

  // ── Protected: Testimonial ────────────────────────────
  if (pathname === '/api/admin/testimonial') {
    if (!requireAuth(req, res)) return;
    if (method === 'PUT') {
      const body = await readBody(req);
      let data;
      try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      const db = readDB();
      db.testimonial = { ...db.testimonial, ...data };
      writeDB(db);
      return json(res, 200, db.testimonial);
    }
  }

  // ── Protected: Tags ───────────────────────────────────
  if (pathname === '/api/admin/tags') {
    if (!requireAuth(req, res)) return;
    if (method === 'PUT') {
      const body = await readBody(req);
      let data;
      try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      const db = readDB();
      db.tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim()).filter(Boolean);
      writeDB(db);
      return json(res, 200, { tags: db.tags });
    }
  }

  // ── Uploaded files ────────────────────────────────────
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOADS_DIR, filename);
    return serveFile(res, filePath);
  }

  // ── Admin panel static files ──────────────────────────
  if (pathname === '/admin' || pathname === '/admin/') {
    return serveFile(res, path.join(__dirname, '../admin/index.html'));
  }

  if (pathname.startsWith('/admin/')) {
    const rel = pathname.slice('/admin/'.length);
    return serveFile(res, path.join(__dirname, '../admin', rel));
  }

  // ── Portfolio static files ────────────────────────────
  // Serve assets
  if (pathname.startsWith('/assets/')) {
    const filePath = path.join(__dirname, '..', pathname);
    if (fs.existsSync(filePath)) return serveFile(res, filePath);
  }

  // Root — serve portfolio
  if (pathname === '/' || pathname === '/index.html') {
    return serveFile(res, path.join(__dirname, '../index.html'));
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
}

// ── Start server ─────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      json(res, 500, { error: 'Internal server error' });
    }
  }
});

server.listen(PORT, () => {
  console.log('\n  Portfolio server running');
  console.log(`  Portfolio:   http://localhost:${PORT}`);
  console.log(`  Admin panel: http://localhost:${PORT}/admin`);
  console.log(`  Login:       ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log('\n  Press Ctrl+C to stop\n');
});