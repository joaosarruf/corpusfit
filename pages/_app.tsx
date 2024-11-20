// pages/_app.tsx

import '../styles/globals.css'; // Importar estilos globais
import type { AppProps } from 'next/app';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Importar o componente Image do Next.js

const Header: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleNavigation = (path: string) => {
    router.push(path);
    closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <>
      <header className="header">
        <div 
          className="logo" 
          onClick={() => router.push('/')}
          style={{ cursor: 'pointer' }}
        >
          <Image src="/images/Logo.svg" alt="Logo" width={100} height={50} />
        </div>
        <div className="Name">
          <Image src="/images/Logo.name.png" alt="Logoname" width={150} height={50} />
        </div>

        <div className="login-options">
          {isLoggedIn ? (
            <button className="logoutButton" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button className="loginAluno" onClick={() => handleNavigation('/login')}>Logar</button>
            </>
          )}
        </div>
        <div className="menu-icon" onClick={toggleSidebar}>
          &#9776;
        </div>
      </header>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={closeSidebar}>&times;</button>
        {!isLoggedIn && (
          <>
            <a onClick={() => handleNavigation('/login')}>Logar</a>
          </>
        )}
        <a href="https://wa.me/+558791985907" className="contact-link" onClick={closeSidebar}>
          WhatsApp: (87) 9198-5907
        </a>
      </div>

      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
      <div className="bg-overlay"></div>
    </>
  );
};

const FloatingWhatsAppIcon: React.FC = () => (
  <div className="whatsapp-float">
    <a href="https://wa.me/+558791985907" target="_blank" rel="noopener noreferrer">
      <Image src="/images/whatsapp.png" alt="WhatsApp" width={120} height={120} />
    </a>
  </div>
);

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      document.body.classList.toggle('professor-dashboard', url.startsWith('/professordashboard'));
    };

    handleRouteChange(router.pathname);
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Header />
      <Component {...pageProps} />
      <FloatingWhatsAppIcon />
    </>
  );
};

export default MyApp;
