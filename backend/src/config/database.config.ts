import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'hotel_user',
  password: process.env.POSTGRES_PASSWORD ?? 'hotel_pass',
  name: process.env.POSTGRES_DB ?? 'hotel_db',
}));
