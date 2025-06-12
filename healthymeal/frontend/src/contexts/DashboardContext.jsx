import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext({});

export const useDashboard = () => {
  return useContext(DashboardContext);
};

export const DashboardProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshDashboard = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardContext.Provider value={{ refreshTrigger, refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider; 