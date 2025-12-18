import { DataSource, DataSourceOptions } from 'typeorm';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'hotel_user',
  password: process.env.DATABASE_PASSWORD ?? 'hotel_pass',
  database: process.env.DATABASE_NAME ?? 'hotel_db',
  entities: ['dist/**/*.schema.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

export default dataSourceOptions;



