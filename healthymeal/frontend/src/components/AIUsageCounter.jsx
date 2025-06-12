import React, { useEffect } from 'react';
import { useAI } from '../contexts/AIContext';

const AIUsageCounter = () => {
  const { usage, error, loading, fetchUsage } = useAI();

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3 mt-4">
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Użycie AI</h3>
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`rounded-full h-2 transition-all duration-300 ${
                usage.current >= usage.limit ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min((usage.current / usage.limit) * 100, 100)}%`,
              }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {usage.current} / {usage.limit}
          </span>
        </div>
      )}
      {!error && usage.remaining > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Pozostało {usage.remaining} modyfikacji na dziś
        </p>
      )}
    </div>
  );
};

export default AIUsageCounter; 