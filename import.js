import { DataTypes } from 'sequelize';
import sequelize from './db.js';
import moment from 'moment';
import XLSX from 'xlsx';

export async function importExcel(filePath) {
  try {
    console.log(`Dosya Yolu: ${filePath}`);
    const fileNameWithExtension = filePath.split('/').pop();
    const fileName = fileNameWithExtension.split('.')[0];

    // Excel dosyasını oku
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      throw new Error("Excel dosyası boş.");
    }

    const determineColumnTypes = (data) => {
      const columnTypes = {};
      const sampleRows = data.slice(0, 10);

      for (const column in sampleRows[0]) {
        const values = sampleRows.map((row) => row[column]);

        if (
          values.every(
            (value) =>
              value === true || value === false || value === 'true' || value === 'false'
          )
        ) {
          columnTypes[column] = DataTypes.BOOLEAN;
        }
        else if (values.every((value) => !isNaN(value) && value !== null && value !== '')) {
          columnTypes[column] = DataTypes.INTEGER;
        }

        else if (values.every((value) => moment(value, 'YYYY-MM-DD', true).isValid())) {
          columnTypes[column] = DataTypes.DATE;
        } else {
          columnTypes[column] = DataTypes.STRING;
        }
      }

      return columnTypes;
    };

    // Veri tiplerini çıkar
    const columns = determineColumnTypes(sheetData);

    const DynamicModel = sequelize.define(
      fileName,
      Object.keys(columns).reduce((fields, column) => {
        fields[column] = { type: columns[column] };
        return fields;
      }, {}),
      {
        timestamps: false,
      }
    );

    // Tabloyu veritabanına senkronize et
    await DynamicModel.sync({ force: true });

    // Veriyi ekle
    await DynamicModel.bulkCreate(sheetData);
    console.log("Veriler başarıyla veritabanına eklendi.");

  } catch (error) {
    console.error("Hata oluştu:", error);
  }
}
