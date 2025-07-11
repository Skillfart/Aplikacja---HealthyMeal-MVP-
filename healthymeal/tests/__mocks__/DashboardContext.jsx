// __mocks__/DashboardContext.jsx - Mock DashboardContext dla testów
import React, { createContext, useContext } from 'react';

const DashboardContext = createContext({});

// Mock hook
export const useDashboard = () => ({
  recipes: [],
  loading: false,
  error: null,
  searchTerm: '',
  filterTags: [],
  setSearchTerm: jest.fn(),
  setFilterTags: jest.fn(),
  fetchRecipes: jest.fn(),
  deleteRecipe: jest.fn(),
  refreshData: jest.fn()
});

// Mock Provider
export const DashboardProvider = ({ children }) => {
  return (
    <DashboardContext.Provider value={useDashboard()}>
      {children}
    </DashboardContext.Provider>
  );
}; 