import { registerAs } from '@nestjs/config';
import { Dialect } from 'sequelize';

const database = {
  host: 'sql.freedb.tech',
  database__name: 'freedb_azenco',
  username: 'freedb_nuraga',
  password: '$nfGYZZ6Ats5WZ5',
  port: 3306,
  dialect: 'mysql',
  SQL_LOGGING: true,
  PORT: 3000,
  SECRET: 'VeryHardSecRetAzenco',
  EXPIRED_JWT: 10000,
};

const { dialect, database__name, host, port, password, username } = database;

export const sqlConfig = registerAs('database', () => ({
  dialect: <Dialect>process.env.SQL_DIALECT || 'mysql' || dialect,
  host,
  port,
  username,
  password: password,
  database: database__name,
  autoLoadEntities: true,
  synchronize: true,
}));
