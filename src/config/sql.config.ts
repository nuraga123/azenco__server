import { registerAs } from '@nestjs/config';
import { Dialect } from 'sequelize';
import { database } from '../../database';

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
