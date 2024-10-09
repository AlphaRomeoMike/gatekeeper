import { DataSourceOptions, DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const configuration: DataSourceOptions = {
  type: (process.env.TYPE as any) ?? 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) ?? 5432,
  username: process.env.DB_USERNAME || 'gatekeeper',
  password: process.env.DB_PASSWORD || 'gatekeeper',
  database: process.env.DB_NAME || 'gatekeep',
  synchronize: false,
  multipleStatements: true,
  logging: true,
  entities: ['**/*.entity{ .ts,.js}'],
  migrations: ['dist/migration/*{.ts,.js}'],
  migrationsRun: true,
};

const datasource = new DataSource(configuration);

export default datasource;
