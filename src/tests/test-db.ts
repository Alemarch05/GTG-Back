import dotenv from 'dotenv';
import { pool } from '../config/database';

dotenv.config();

async function testConnection() {
  console.log('=== INICIANDO PRUEBA DE CONEXION ==='); 
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS fecha, current_database() AS bd;');
    console.log('CONEXION EXITOSA');
    console.log('Base de datos:', res.rows[0].bd);
    console.log('Fecha servidor:', res.rows[0].fecha);
    client.release();
  } catch (error) {
    console.error('Error de conexion:', error);
  } finally {
    await pool.end();
  }
}

testConnection();