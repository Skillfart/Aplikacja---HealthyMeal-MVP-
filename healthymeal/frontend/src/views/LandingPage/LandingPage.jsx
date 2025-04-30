import React from 'react';
import { Header } from './components/Header/Header';
import { HeroSection } from './components/HeroSection/HeroSection';
import { FeatureShowcase } from './components/FeatureShowcase/FeatureShowcase';
import { RecipeComparison } from './components/RecipeComparison/RecipeComparison';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { CTASection } from './components/CTASection/CTASection';
import { Footer } from './components/Footer/Footer';
import { LoginModal } from './components/LoginModal/LoginModal';
import { RegisterModal } from './components/RegisterModal/RegisterModal';
import { useModal } from './hooks/useModal';
import styles from './LandingPage.module.css';

export const LandingPage = () => {
  const { 
    loginModalOpen, 
    registerModalOpen, 
    openLoginModal, 
    openRegisterModal, 
    closeModals 
  } = useModal();

  return (
    <div className={styles.landingPage}>
      <Header onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
      <main className={styles.main}>
        <HeroSection onCtaClick={openRegisterModal} />
        <FeatureShowcase />
        <RecipeComparison />
        <HowItWorks />
        <CTASection onCtaClick={openRegisterModal} />
      </main>
      <Footer />
      
      {loginModalOpen && (
        <LoginModal 
          onClose={closeModals} 
          onRegisterLinkClick={openRegisterModal} 
        />
      )}
      
      {registerModalOpen && (
        <RegisterModal 
          onClose={closeModals} 
          onLoginLinkClick={openLoginModal} 
        />
      )}
    </div>
  );
}; 