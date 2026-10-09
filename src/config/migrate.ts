import { pool } from './database.ts';


const schema = [
  {
    table: 'users',
    create: `
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    columns: [
      { name: 'name', def: 'VARCHAR(100) NOT NULL' },
      { name: 'email', def: 'VARCHAR(150) UNIQUE NOT NULL' },
      { name: 'password', def: 'VARCHAR(255) NOT NULL' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ]
  },
  {
    table: 'refresh_tokens',
    create: `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          is_revoked BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `,
    columns: [
      { name: 'user_id', def: 'INT NOT NULL' },
      { name: 'token_hash', def: 'VARCHAR(255) NOT NULL' },
      { name: 'expires_at', def: 'TIMESTAMP NOT NULL' },
      { name: 'is_revoked', def: 'BOOLEAN DEFAULT FALSE' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ]
  }
];

async function runMigrations() {
  try {
    for (const entry of schema) {
      // 1. Crea la tabla si no existe
      await pool.query(entry.create);

      // 2. Valida columnas faltantes por si la tabla ya existía
      const { rows } = await pool.query(
        'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
        [entry.table]
      );
      const existing = rows.map((r: any) => r.column_name);

      for (const col of entry.columns) {
        if (!existing.includes(col.name)) {
          await pool.query(`ALTER TABLE ${entry.table} ADD COLUMN IF NOT EXISTS ${col.name} ${col.def}`);
          console.log(`Columna añadida: ${entry.table}.${col.name}`);
        }
      }
      console.log(`Tabla lista: ${entry.table}`);
    }
    console.log('Migraciones ejecutadas exitosamente.');
  } catch (error) {
    console.error('Error en migraciones:', error);
  }
}

export default runMigrations;