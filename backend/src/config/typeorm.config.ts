import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const isTsRuntime = __filename.endsWith('.ts');

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'hotel_user',
  password: process.env.POSTGRES_PASSWORD ?? 'hotel_pass',
  database: process.env.POSTGRES_DB ?? 'hotel_db',
  entities: isTsRuntime
    ? ['src/**/*.entity.ts', 'src/**/*.schema.ts']
    : ['dist/**/*.entity.js', 'dist/**/*.schema.js'],
  migrations: isTsRuntime
    ? ['src/migrations/*.ts']
    : ['dist/migrations/*.js'],
  synchronize: false,
  logging: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

export default dataSourceOptions;
