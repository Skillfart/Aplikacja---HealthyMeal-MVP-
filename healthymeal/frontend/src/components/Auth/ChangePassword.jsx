import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { validatePassword, getPasswordStrength } from '../../utils/passwordValidator';

const ChangePassword = () => {
  const { updatePassword, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.currentPassword) {
      errors.currentPassword = 'Aktualne hasło jest wymagane';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'Nowe hasło jest wymagane';
    } else {
      const validation = validatePassword(formData.newPassword);
      if (!validation.isValid) {
        errors.newPassword = validation.errors[0];
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Hasła nie są identyczne';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'newPassword') {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await updatePassword(formData.currentPassword, formData.newPassword);
      toast.success('Hasło zostało zmienione pomyślnie!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength(null);
    } catch (error) {
      console.error('Błąd zmiany hasła:', error);
      
      const errorMessage = {
        'Invalid password': 'Aktualne hasło jest nieprawidłowe',
        'New password is too weak': 'Nowe hasło jest zbyt słabe',
        'Rate limit exceeded': 'Zbyt wiele prób zmiany hasła. Spróbuj ponownie później'
      }[error.message] || 'Wystąpił błąd podczas zmiany hasła';
      
      toast.error(errorMessage);
    }
  };

  const getStrengthColor = (score) => {
    const colors = ['red', 'orange', 'yellow', 'lime', 'green'];
    return colors[score] || 'gray';
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Zmień hasło
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Aktualne hasło
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
              ${formErrors.currentPassword ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            disabled={loading}
          />
          {formErrors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            Nowe hasło
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
              ${formErrors.newPassword ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            disabled={loading}
          />
          {passwordStrength && (
            <div className="mt-1">
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full bg-${getStrengthColor(passwordStrength.score)}-500`}
                  style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                />
              </div>
              <p className={`text-sm mt-1 text-${getStrengthColor(passwordStrength.score)}-600`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
          {formErrors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Potwierdź nowe hasło
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
              ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            disabled={loading}
          />
          {formErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
          >
            {loading ? 'Aktualizacja...' : 'Zmień hasło'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword; 