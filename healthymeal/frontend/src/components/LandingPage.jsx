import React from 'react';

const LandingPage = () => (
  <div className="landing">
    <header className="landing-header">
      <h1>HealthyMeal</h1>
      <div>
        <a href="/login" className="header-link">Zaloguj się</a>
        <a href="/register" className="header-link primary">Zarejestruj się</a>
      </div>
    </header>
    <section className="hero">
      <h2>Zadbaj o zdrowe posiłki z pomocą AI</h2>
      <p>Twórz i modyfikuj przepisy dostosowane do Twoich potrzeb.</p>
      <a href="/register" className="cta-button">Rozpocznij za darmo</a>
    </section>
  </div>
);

export default LandingPage;
