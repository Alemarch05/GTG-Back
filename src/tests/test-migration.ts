import dotenv from 'dotenv';
import { runMigrations } from '../migrations/migrate';
import { pool } from '../config/database';

dotenv.config();

async function test() {
  try {
    await runMigrations();
    console.log('migracion completada con exito!');
  } catch (error) {
    console.error('error en la migracion:', error);
  } finally {
    await pool.end();
  }
}

test();