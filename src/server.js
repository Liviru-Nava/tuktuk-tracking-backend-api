import dotenv from 'dotenv';
dotenv.config();

import app from './config/app.js';
import db  from './config/knex.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection before starting
    await db.raw('SELECT 1');
    console.log('Database connection established');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
}

startServer();