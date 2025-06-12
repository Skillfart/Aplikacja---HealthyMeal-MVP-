import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AIProvider } from './contexts/AIContext';
import NavigationBar from './components/NavigationBar';
import AppRoutes from './AppRoutes';
import './index.css';

export const RefreshContext = createContext();

const App = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <AIProvider>
        <Router>
          <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
            <div className="app">
              <NavigationBar />
              <AppRoutes />
            </div>
          </RefreshContext.Provider>
        </Router>
      </AIProvider>
    </AuthProvider>
  );
};

export default App;