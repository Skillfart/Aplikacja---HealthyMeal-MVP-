// Konfiguracja połączenia z bazą danych MongoDB
const dotenv = require('dotenv');
const path = require('path');

// Załaduj odpowiedni plik .env
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/healthymeal",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs'
}; 