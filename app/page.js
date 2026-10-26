'use client';

import { useState, useEffect } from 'react';
import { defaultData } from '@/lib/defaultData';

export default function Home() {
  const [data, setData] = useState(defaultData);
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theme and dynamic data from API (backed by Vercel Blob / local fallback)
  useEffect(() => {
    const savedTheme = localStorage.getItem('remess_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    async function loadData() {
      try {
        const res = await fetch('/api/data', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setData(json.data);
          }
        }
      } catch (err) {
        console.warn('Using default profile data due to network error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('remess_theme', newTheme);
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      triggerToast(`${label} copié dans le presse-papier !`);
    });
  };


  const shareCard = async () => {
    const general = data.general || defaultData.general;
    const shareData = {
      title: `${general.orgName} - Carte NFC Digitale`,
      text: general.subtitle,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        triggerToast('Lien de la carte copié !');
      });
    }
  };

  const { general = defaultData.general, links = defaultData.links } = data;

  return (
    <>
      {/* Top Sticky Navigation Bar */}
      <nav className="top-nav">
        <div className="container nav-content">
          <div className="nfc-badge">
            <span className="nfc-pulse-dot"></span>
            <span>{general.badgeText || 'Carte NFC Digitale'}</span>
          </div>

          <button
            id="themeToggleBtn"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Changer le thème"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </nav>

      <main className="container">
        {/* Hero / NFC Profile Section */}
        <section className="hero-section">
          <div className="glass-card hero-card">
            <div className="hero-header-bg"></div>

            {/* Glowing Conic Halo & Floating Logo */}
            <div className="logo-wrapper">
              <img
                src={general.logoUrl || '/assets/REMESS.png'}
                alt="REMESS Logo"
                className="logo-img"
              />
            </div>

            <h1 className="org-title">{general.orgName}</h1>
            <p className="org-subtitle">{general.subtitle}</p>

            {general.tags && general.tags.length > 0 && (
              <div className="tag-pills">
                {general.tags.map((tag, idx) => (
                  <span key={idx} className="pill">{tag}</span>
                ))}
              </div>
            )}

            {general.bio && (
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: '1.5',
                marginBottom: '1.2rem',
                padding: '0 0.5rem'
              }}>
                {general.bio}
              </p>
            )}

            {/* Primary Action Grid */}
            <div className="nfc-actions-grid">
              {links.whatsapp?.enabled && (
                <a
                  href={`https://wa.me/${links.whatsapp.value?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tile wa"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>WhatsApp</span>
                </a>
              )}

              {links.phone?.enabled && (
                <a
                  href={`tel:${links.phone.value?.replace(/[^0-9+]/g, '')}`}
                  className="btn-tile call"
                >
                  <i className="fa-solid fa-phone"></i>
                  <span>Appeler</span>
                </a>
              )}

              {links.maps?.enabled && (
                <a
                  href={links.maps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tile maps"
                >
                  <i className="fa-solid fa-location-dot"></i>
                  <span>Maps</span>
                </a>
              )}

              <button className="btn-tile share" onClick={shareCard}>
                <i className="fa-solid fa-share-nodes"></i>
                <span>Partager</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            LES 7 ÉLÉMENTS REQUIS :
            FACEBOOK, INSTAGRAM, LINKEDIN, EMAIL, SITEWEB, MAPS, REVIEWS
            =================================================================== */}

        {/* 1. Réseaux Sociaux & Contact : Facebook, Instagram, LinkedIn, Email */}
        <section className="socials-section">
          <div className="section-header">
            <i className="fa-solid fa-share-nodes"></i>
            <h2>Réseaux Sociaux & Contact</h2>
          </div>

          <div className="social-tiles-grid">
            {/* FACEBOOK */}
            {links.facebook?.enabled && (
              <a
                href={links.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-tile fb"
                id="link-facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
                <div className="social-meta">
                  <span className="social-name">Facebook</span>
                  <span className="social-sub">{links.facebook.handle || 'Suivez-nous'}</span>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tile-action-icon"></i>
              </a>
            )}

            {/* INSTAGRAM */}
            {links.instagram?.enabled && (
              <a
                href={links.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-tile ig"
                id="link-instagram"
              >
                <i className="fa-brands fa-instagram"></i>
                <div className="social-meta">
                  <span className="social-name">Instagram</span>
                  <span className="social-sub">{links.instagram.handle || '@remess_maroc'}</span>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tile-action-icon"></i>
              </a>
            )}

            {/* LINKEDIN */}
            {links.linkedin?.enabled && (
              <a
                href={links.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-tile ln"
                id="link-linkedin"
              >
                <i className="fa-brands fa-linkedin-in"></i>
                <div className="social-meta">
                  <span className="social-name">LinkedIn</span>
                  <span className="social-sub">{links.linkedin.handle || 'Réseau Professionnel'}</span>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tile-action-icon"></i>
              </a>
            )}

            {/* EMAIL */}
            {links.email?.enabled && (
              <a
                href={`mailto:${links.email.value}`}
                className="social-tile email"
                id="link-email"
              >
                <i className="fa-solid fa-envelope"></i>
                <div className="social-meta">
                  <span className="social-name">Email</span>
                  <span className="social-sub">{links.email.value}</span>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tile-action-icon"></i>
              </a>
            )}
          </div>
        </section>

        {/* 2. SITEWEB : Affiché uniquement si activé */}
        {links.siteweb?.enabled && (
          <section className="channels-section">
            <div className="section-header">
              <i className="fa-solid fa-globe"></i>
              <h2>Site Web</h2>
            </div>

            <div className="social-tiles-grid">
              <a
                href={links.siteweb.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-tile siteweb full-width"
                id="link-siteweb"
              >
                <i className="fa-solid fa-globe"></i>
                <div className="social-meta">
                  <span className="social-name">Site Web Officiel</span>
                  <span className="social-sub">{links.siteweb.label || links.siteweb.url}</span>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tile-action-icon"></i>
              </a>
            </div>
          </section>
        )}

        {/* 3. MAPS : Localisation & Itinéraire */}
        {links.maps?.enabled && (
          <section className="maps-section">
            <div className="section-header">
              <i className="fa-solid fa-map-location-dot"></i>
              <h2>Localisation Siège</h2>
            </div>

            <div className="glass-card maps-card">
              <div className="maps-info-row">
                <div className="maps-icon-bubble">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="maps-details">
                  <h4>Siège National</h4>
                  <p>{links.maps.address}</p>
                </div>
              </div>

              <a
                href={links.maps.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-maps-action"
                id="link-maps"
              >
                <i className="fa-solid fa-diamond-turn-right"></i>
                <span>Ouvrir dans Google Maps</span>
              </a>
            </div>
          </section>
        )}

        {/* 4. REVIEWS : Avis Clients & Évaluations */}
        {links.reviews?.enabled && (
          <section className="reviews-section">
            <div className="section-header">
              <i className="fa-solid fa-star"></i>
              <h2>Avis & Recommandations</h2>
            </div>

            <div className="glass-card reviews-card">
              <div className="reviews-badge-top">
                <i className="fa-solid fa-shield-heart"></i>
                <span>Satisfaction Partenaires</span>
              </div>

              <div className="reviews-stars">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>

              <p className="reviews-score-text">
                Note de <strong>{links.reviews.rating || '5.0'} / 5.0</strong> • {links.reviews.reviewCount || 'Avis vérifiés'}
              </p>

              <a
                href={links.reviews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-review-action"
                id="link-reviews"
              >
                <i className="fa-solid fa-pen-to-square"></i>
                <span>{links.reviews.label || 'Laisser un avis (5.0 ★)'}</span>
              </a>
            </div>
          </section>
        )}

        <footer className="footer">
          <p>© 2026 <strong>{general.orgName}</strong></p>
          <p style={{ marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Propulsé par Next.js & Vercel Blob
          </p>
        </footer>
      </main>

      {/* Sticky Bottom Floating Bar on Mobile */}
      <div className="mobile-float-bar">
        {links.whatsapp?.enabled && (
          <a
            href={`https://wa.me/${links.whatsapp.value?.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="float-btn float-btn-primary"
          >
            <i className="fa-brands fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
        )}

        {links.phone?.enabled && (
          <a
            href={`tel:${links.phone.value?.replace(/[^0-9+]/g, '')}`}
            className="float-btn"
          >
            <i className="fa-solid fa-phone"></i>
            <span>Appeler</span>
          </a>
        )}

        {links.maps?.enabled && (
          <a
            href={links.maps.url}
            target="_blank"
            rel="noopener noreferrer"
            className="float-btn"
          >
            <i className="fa-solid fa-location-dot"></i>
            <span>Maps</span>
          </a>
        )}

        <button className="float-btn" onClick={shareCard}>
          <i className="fa-solid fa-share-nodes"></i>
          <span>Partager</span>
        </button>
      </div>

      {/* Toast Alert */}
      <div id="toastNotification" className={`toast-container ${showToast ? 'show' : ''}`}>
        <div className={`toast ${showToast ? 'show' : ''}`}>
          <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-gold)' }}></i>
          <span>{toastMessage}</span>
        </div>
      </div>
    </>
  );
}
