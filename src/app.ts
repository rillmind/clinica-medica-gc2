import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos';

const app = express();

app.disable('x-powered-by');

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/produtos', produtosRoutes);

export default app;
