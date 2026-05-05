import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';

const isTsRuntime = __filename.endsWith('.ts');

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',

  host:
    process.env.DATABASE_HOST ||
    process.env.POSTGRES_HOST ||
    'postgres',

  port: parseInt(
    process.env.DATABASE_PORT ||
      process.env.POSTGRES_PORT ||
      '5432',
    10,
  ),

  username:
    process.env.DATABASE_USER ||
    process.env.POSTGRES_USER ||
    'hotel_user',

  password:
    process.env.DATABASE_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    'hotel_pass',

  database:
    process.env.DATABASE_NAME ||
    process.env.POSTGRES_DB ||
    'hotel_db',

  entities: isTsRuntime
    ? ['src/**/*.entity.ts', 'src/**/*.schema.ts']
    : ['dist/**/*.entity.js', 'dist/**/*.schema.js'],

  migrations: isTsRuntime
    ? ['src/migrations/*.ts']
    : ['dist/migrations/*.js'],

  synchronize: false,
  logging: false,
};