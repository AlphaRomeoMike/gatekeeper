import { DataSourceOptions, DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const configuration: DataSourceOptions = {
  type: (process.env.TYPE as any) ?? 'postgres',
  host: process.env.DB_HOST || '10.10.44.69',
  port: parseInt(process.env.DB_PORT, 10) ?? 4510,
  username: process.env.DB_USERNAME || 'docker',
  password: process.env.DB_PASSWORD || 'docker',
  database: process.env.DB_NAME || 'docker',
  synchronize: false,
  multipleStatements: true,
  logging: true,
  entities: ['**/*.entity{ .ts,.js}'],
  migrations: ['dist/migration/*{.ts,.js}'],
  migrationsRun: true,
};

const datasource = new DataSource(configuration);

export default datasource;
