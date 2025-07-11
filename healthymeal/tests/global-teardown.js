// Global teardown dla testów E2E
async function globalTeardown() {
  console.log('🧹 Starting global teardown for E2E tests');
  
  // Możesz dodać tutaj czyszczenie
  // np. czyszczenie bazy danych, plików testowych itp.
  
  return Promise.resolve();
}

export default globalTeardown; 