import { useState } from 'react';

export const useModal = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  
  const openLoginModal = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };
  
  const openRegisterModal = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };
  
  const closeModals = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
  };
  
  return { 
    loginModalOpen, 
    registerModalOpen, 
    openLoginModal, 
    openRegisterModal, 
    closeModals 
  };
}; 