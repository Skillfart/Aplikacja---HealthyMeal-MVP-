import React, { useState } from 'react';
import ChangePassword from '../Auth/ChangePassword';
import SessionManager from '../Auth/SessionManager';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('password');

  const tabs = {
    password: {
      label: 'Zmiana hasła',
      component: <ChangePassword />
    },
    sessions: {
      label: 'Aktywne sesje',
      component: <SessionManager />
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Ustawienia konta
      </h1>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {Object.entries(tabs).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {tabs[activeTab].component}
      </div>
    </div>
  );
};

export default Settings; 