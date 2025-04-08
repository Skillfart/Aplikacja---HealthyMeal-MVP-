// W tym pliku należy skonfigurować połączenie z bazą danych MongoDB
module.exports = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "healthymeal",
    options: {
      // brak dodatkowych opcji
    }
  },
  migrationsDir: "migrations-files",  // katalog z plikami migracji
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false
}; 