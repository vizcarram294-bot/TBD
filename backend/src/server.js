import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import detailsRoutes from './routes/details.routes.js';
import optionsRoutes from './routes/options.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import materialesRoutes from './routes/materiales.js';
import { getPool } from './config/db.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', async (_req, res) => {
  try {
    await getPool();
    res.json({ ok: true, db: 'connected', engine: 'SQL Server' });
  } catch (error) {
    res.status(500).json({ ok: false, db: 'error', message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/details', authenticateToken, detailsRoutes);
app.use('/api/options', authenticateToken, optionsRoutes);
app.use('/api', resourceRoutes);
app.use('/api/materiales', authenticateToken, materialesRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor',
    detail: err.originalError?.info?.message || err.precedingErrors?.[0]?.message || undefined,
  });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`ConstruSys API corriendo en http://localhost:${port}`));
