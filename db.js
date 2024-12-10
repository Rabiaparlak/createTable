import { Sequelize } from 'sequelize';

// Veritabanı bağlantısı
const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'postgres',
  username: 'ronesans3',
  database: 'createTable',
  logging: false,
});

export default sequelize;
