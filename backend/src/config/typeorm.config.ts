import { DataSource, DataSourceOptions } from 'typeorm';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'hotel_user',
  password: process.env.POSTGRES_PASSWORD ?? 'hotel_pass',
  database: process.env.POSTGRES_DB ?? 'hotel_db',
  entities: ['dist/**/*.schema.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

export default dataSourceOptions;
