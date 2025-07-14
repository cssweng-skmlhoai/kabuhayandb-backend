import express, { urlencoded, json } from 'express';
import cors from 'cors';
import { initDB, closeDB } from './config/connect.js';
import duesRouter from './routes/dues.routes.js';
import membersRouter from './routes/members.routes.js';
import familiesRouter from './routes/families.routes.js';
import householdsRouter from './routes/households.routes.js';
import credentialsRouter from './routes/credentials.routes.js';
import uploadRouter from './routes/uploads.routes.js';
import { authenticateApiSecret } from './middlewares/auth.middleware.js';
import 'dotenv/config';

const app = express();

const startServer = async () => {
  try {
    await initDB();
    console.log('Database initialized');
    const allowedOrigins = [
      'http://localhost:5173',
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    app.use(json());
    app.use(urlencoded({ extended: true }));
    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      })
    );

    app.use(authenticateApiSecret);

    app.use('/dues', duesRouter);
    app.use('/members', membersRouter);
    app.use('/families', familiesRouter);
    app.use('/households', householdsRouter);
    app.use('/credentials', credentialsRouter);
    app.use('/uploads', uploadRouter);

    app.get('/', (req, res) => {
      res.status(200).json({
        status: 'Ok',
        message: 'KabuhayanDB API is running.',
      });
    });

    const server = app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port: ${process.env.PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down...');

      server.close();

      try {
        await closeDB();

        console.log('All connections closed.');
        process.exit(0);
      } catch (err) {
        console.log('Error on shutdown: ', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Server startup error: ', err);
    process.exit(1);
  }
};

startServer().catch((err) => {
  console.error('Error during server initialization: ', err);
  process.exit(1);
});

export default app;
