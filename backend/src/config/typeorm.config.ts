import { DataSource } from 'typeorm';
import { join } from 'path';

const dataSource = new DataSource({
  type: 'postgres',

  host: process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'postgres',
  port: Number(process.env.DATABASE_PORT || process.env.POSTGRES_PORT || 5432),

  username: process.env.DATABASE_USER || process.env.POSTGRES_USER || 'hotel_user',
  password: process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD || 'hotel_pass',
  database: process.env.DATABASE_NAME || process.env.POSTGRES_DB || 'hotel_db',

  entities: [join(__dirname, '../**/*.entity.js')],
  migrations: [join(__dirname, '../migrations/*.js')],

  synchronize: false,
});

export default dataSource;