import { pool } from '../config/database';

export async function migrateContributions() {
  const schema = {
    table: 'contributions',
    create: `
      CREATE TABLE IF NOT EXISTS contributions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID NOT NULL,
        user_id UUID NOT NULL,
        amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
        status VARCHAR(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'RELEASED', 'REFUNDED')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
    columns: [
      { name: 'campaign_id', def: 'UUID NOT NULL' },
      { name: 'user_id', def: 'UUID NOT NULL' },
      { name: 'amount', def: 'NUMERIC(14, 2) NOT NULL' },
      { name: 'status', def: "VARCHAR(20) NOT NULL DEFAULT 'HELD'" },
      { name: 'created_at', def: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' }
    ]
  };

  try {
    //Crear la tabla si no existe
    await pool.query(schema.create);

    //Verificar columnas existentes para agregarlas si faltan
    const { rows } = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
      [schema.table]
    );
    const existing = rows.map((r: { column_name: string }) => r.column_name);

    for (const col of schema.columns) {
      if (!existing.includes(col.name)) {
        await pool.query(`ALTER TABLE ${schema.table} ADD COLUMN ${col.name} ${col.def}`);
        console.log(`[Migrations] Columna añadida a ${schema.table}: ${col.name}`);
      }
    }

    console.log(`Tabla lista: ${schema.table}`);
  } catch (error) {
    console.error(`Error al migrar ${schema.table}:`, error);
    throw error;
  }
}