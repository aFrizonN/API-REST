import express from 'express';
import cors from 'cors'; // Note: I should add this to package.json if I use it, or just use express defaults
import routes from './routes';

const app = express();

app.use(express.json());
// app.use(cors()); // Optional, but good for APIs

app.use('/api', routes);

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
