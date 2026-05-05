import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
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

  name:
    process.env.DATABASE_NAME ||
    process.env.POSTGRES_DB ||
    'hotel_db',
}));