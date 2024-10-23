import { DataSourceOptions, DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

config();

export const configuration: DataSourceOptions & SeederOptions = {
  type: (process.env.DB_TYPE as any) ?? 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) ?? 5432,
  username: process.env.DB_USERNAME || 'gatekeeper',
  password: process.env.DB_PASSWORD || 'gatekeeper',
  database: process.env.DB_NAME || 'gatekeep',
  synchronize: true,
  multipleStatements: true,
  logging: true,
  entities: ['**/*.entity{ .ts,.js}'],
  seeds: ['**/*.seeder{ .ts,.js}'],
  factories: ['**/*.factory{ .ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsRun: true,
};

const datasource = new DataSource(configuration);

export default datasource;
