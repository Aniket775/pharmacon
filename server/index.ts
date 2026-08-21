import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { getDb } from './db.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import versionRoutes from './routes/versions.js';
import deliverableRoutes from './routes/deliverables.js';
import teamRoutes from './routes/team.js';
import workflowRoutes from './routes/workflow.js';
import contentRoutes from './routes/content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const preferredPort = parseInt(process.env.PORT || '4174', 10);

const getAvailablePort = (port: number): number => {
  let candidate = port;
  while (true) {
    try {
      const testServer = app.listen(candidate);
      testServer.close();
      return candidate;
    } catch (error: any) {
      if (error?.code === 'EADDRINUSE') {
        candidate += 1;
        continue;
      }
      throw error;
    }
  }
};

const PORT = getAvailablePort(preferredPort);

// Ensure uploads directory exists
const uploadsDir = join(process.env.DATA_DIR || __dirname, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4173', 'http://localhost:4174', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Initialize database
getDb();
console.log('📦 Database initialized');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/team', teamRoutes);
app.use('/api', workflowRoutes);
app.use('/api/content', contentRoutes);

// Production hosting: serve the built React app from the same process as the API.
const clientDist = join(__dirname, '..', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Pharmacon API server running at http://localhost:${PORT}`);
  console.log(`📁 File uploads stored in: ${uploadsDir}`);
});
