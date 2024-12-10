import sequelize from './db.js';
import { importExcel } from './import.js';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı!');

    await sequelize.sync({ force: true });
    try {
      const file_name = 'files/excel.xlsx'
      importExcel(file_name);
      console.log("Dinamik tablo oluşturma ve yükleme işlemi başarılı!")
    } catch (error) {
      console.log("Dinamik tablo oluşturma ve yükleme işlemi başarısız!")
    }

  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
  }
}

main();
