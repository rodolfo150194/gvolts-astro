import mysql from 'mysql2/promise';

const connectionString = import.meta.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    '[DB] Missing DATABASE_URL environment variable. ' +
    'Database features will not work until it is configured.'
  );
}

export const pool = mysql.createPool(connectionString ?? 'mysql://localhost/gvolts');
