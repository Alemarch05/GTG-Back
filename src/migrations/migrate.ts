import { pool } from '../config/database';

const schema = [ //1LLAVE
  { //2LLAVE
    table: 'users',
    create: `
      CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
    `,
    columns: [
      { name: 'name', def: 'VARCHAR(100) NOT NULL' },
      { name: 'email', def: 'VARCHAR(150) UNIQUE NOT NULL' },
      { name: 'password', def: 'VARCHAR(255) NOT NULL' },
      { name: 'role', def: 'VARCHAR(20) NOT NULL DEFAULT \'USER\'' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ]
  }

  ,{
    table: 'campaigns',
    create: `
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
        current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    columns: [
      { name: 'user_id', def: 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE' },
      { name: 'title', def: 'VARCHAR(255) NOT NULL' },
      { name: 'description', def: 'TEXT NOT NULL' },
      { name: 'target_amount', def: 'NUMERIC(14, 2) NOT NULL' },
      { name: 'current_amount', def: 'NUMERIC(14, 2) NOT NULL DEFAULT 0.00' },
      { name: 'status', def: "VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'" },
      { name: 'expires_at', def: 'TIMESTAMP NOT NULL' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ]
  },
  {
      table: 'refresh_tokens',
      create: `
          CREATE TABLE IF NOT EXISTS refresh_tokens (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          is_revoked BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      columns: [
        { name: 'user_id', def: 'UUID NOT NULL' },
        { name: 'token_hash', def: 'VARCHAR(255) NOT NULL UNIQUE' },
        { name: 'expires_at', def: 'TIMESTAMP NOT NULL' },
        { name: 'is_revoked', def: 'BOOLEAN DEFAULT FALSE' },
        { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
  },
  {
    table: 'contributions',
    create: `
      CREATE TABLE IF NOT EXISTS public.contributions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
        status VARCHAR(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'RELEASED', 'REFUNDED')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    columns: [
      { name: 'campaign_id', def: 'UUID NOT NULL' },
      { name: 'user_id', def: 'UUID NOT NULL' },
      { name: 'amount', def: 'NUMERIC(14, 2) NOT NULL' },
      { name: 'status', def: "VARCHAR(20) NOT NULL DEFAULT 'HELD'" },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ]
  }
];

export async function runMigrations() {
  console.log('--- Ejecutando Migraciones ---');
  for (const entry of schema) {
    await pool.query(entry.create);

    const { rows } = await pool.query(
  `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
  [entry.table]
);

    const existing = rows.map((r: { column_name: string }) => r.column_name);

    for (const col of entry.columns) {
      if (!existing.includes(col.name)) {
        await pool.query(`ALTER TABLE ${entry.table} ADD COLUMN IF NOT EXISTS ${col.name} ${col.def}`);
        console.log(`Columna añadida: ${entry.table}.${col.name}`);
      }
    }
    console.log(`Tabla lista: ${entry.table}`);
  }
}

runMigrations().then(() => {
  console.log('Migraciones finalizadas');
}).catch((err) => {
  console.error('Error en la migración:', err);
});