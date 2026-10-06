'use client';

import { useState, useEffect, useRef } from 'react';

// Animated Number Counter Component
function AnimatedCounterItem({ target, prefix = '', suffix = '', label }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (itemRef.current) observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const end = parseInt(target, 10);
    let start = 0;
    const duration = 1600; // ms
    const stepTime = Math.max(Math.floor(duration / end), 20);

    const timer = setInterval(() => {
      start += Math.ceil(end / 35);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasAnimated, target]);

  return (
    <div className="stat-item" ref={itemRef}>
      <h3>{prefix}{count}{suffix}</h3>
      <p>{label}</p>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('remess_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
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

  const downloadVCard = () => {
    const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:REMESS - Réseau Marocain d'Economie Sociale et Solidaire
ORG:REMESS Maroc
TITLE:Réseau Marocain d'Économie Sociale et Solidaire
TEL;TYPE=WORK,VOICE:+212537000000
TEL;TYPE=CELL,WA:+212661000000
EMAIL;TYPE=WORK:contact@remess.ma
URL:https://remess.ma
ADR;TYPE=WORK:;;Avenue Fal Ould Oumeir, Agdal;Rabat;;;Maroc
NOTE:REMESS - Réseau Marocain d'Économie Sociale et Solidaire
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'REMESS_Contact.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast("Fichier vCard téléchargé ! Enregistrez-le dans vos contacts.");
  };

  const shareCard = async () => {
    const shareData = {
      title: 'REMESS - Carte NFC Digitale',
      text: 'Réseau Marocain d\'Économie Sociale et Solidaire',
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
        triggerToast("Lien de la carte copié dans le presse-papier !");
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    triggerToast("Merci ! Votre message a été transmitted à REMESS.");
    e.target.reset();
  };

  return (
    <>
      {/* Top Sticky Navigation Bar */}
      <nav className="top-nav">
        <div className="container nav-content">
          <div className="nfc-badge">
            <span className="nfc-pulse-dot"></span>
            <span>Carte NFC Digitale</span>
          </div>
          
          <button id="themeToggleBtn" className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </nav>

      <main className="container">
        
        {/* Hero / Profile Card Section */}
        <section className="hero-section">
          <div className="glass-card hero-card">
            <div className="hero-header-bg"></div>
            
            {/* Animated Rotating Conic Halo Around Logo */}
            <div className="logo-wrapper">
              <img src="/assets/logoREMESS.png" alt="REMESS Logo" className="logo-img" />
            </div>
            
            <h1 className="org-title">Réseau Marocain d'Économie Sociale et Solidaire</h1>
            <p className="org-subtitle">REMESS • Réseau Associatif National</p>
            
            <div className="tag-pills">
              <span className="pill">Développement Solidaire</span>
              <span className="pill">Égalité des Chances</span>
              <span className="pill">Autonomisation Durable</span>
            </div>

            {/* Primary NFC Quick Actions Grid */}
            <div className="nfc-actions-grid">
              <button className="btn-vcard" onClick={downloadVCard}>
                <i className="fa-solid fa-address-card"></i>
                <span>Enregistrer le Contact</span>
              </button>
              
              <a href="https://wa.me/212661000000" target="_blank" rel="noopener noreferrer" className="btn-tile wa">
                <i className="fa-brands fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>

              <a href="tel:+212537000000" className="btn-tile call">
                <i className="fa-solid fa-phone"></i>
                <span>Appeler</span>
              </a>

              <a href="https://maps.google.com/?q=Rabat+Agdal+Morocco" target="_blank" rel="noopener noreferrer" className="btn-tile maps">
                <i className="fa-solid fa-location-dot"></i>
                <span>Localisation</span>
              </a>

              <button className="btn-tile share" onClick={shareCard}>
                <i className="fa-solid fa-share-nodes"></i>
                <span>Partager</span>
              </button>
            </div>
          </div>
        </section>

        {/* Key Numerical Animated Stats Banner */}
        <section className="stats-section">
          <div className="glass-card stats-grid">
            <AnimatedCounterItem target="250" prefix="+" label="Coopératives" />
            <AnimatedCounterItem target="12" label="Régions" />
            <AnimatedCounterItem target="15" prefix="+" suffix="K" label="Bénéficiaires" />
            <AnimatedCounterItem target="20" suffix="+" label="Ans d'Impact" />
          </div>
        </section>

        {/* Social Media Links (Positioned BEFORE À Propos) */}
        <section className="socials-section">
          <div className="section-header">
            <i className="fa-solid fa-share-nodes"></i>
            <h2>Réseaux Sociaux</h2>
          </div>

          <div className="social-tiles-grid">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-tile fb">
              <i className="fa-brands fa-facebook-f"></i>
              <div className="social-meta">
                <span className="social-name">Facebook</span>
                <span className="social-sub">@REMESS.Maroc</span>
              </div>
            </a>

            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-tile ln">
              <i className="fa-brands fa-linkedin-in"></i>
              <div className="social-meta">
                <span className="social-name">LinkedIn</span>
                <span className="social-sub">REMESS Maroc</span>
              </div>
            </a>

            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-tile ig">
              <i className="fa-brands fa-instagram"></i>
              <div className="social-meta">
                <span className="social-name">Instagram</span>
                <span className="social-sub">@remess_maroc</span>
              </div>
            </a>

            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="social-tile yt">
              <i className="fa-brands fa-youtube"></i>
              <div className="social-meta">
                <span className="social-name">YouTube</span>
                <span className="social-sub">REMESS TV</span>
              </div>
            </a>

            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-tile tw">
              <i className="fa-brands fa-x-twitter"></i>
              <div className="social-meta">
                <span className="social-name">X (Twitter)</span>
                <span className="social-sub">@REMESS_Maroc</span>
              </div>
            </a>

            <a href="https://wa.me/212661000000" target="_blank" rel="noopener noreferrer" className="social-tile wa">
              <i className="fa-brands fa-whatsapp"></i>
              <div className="social-meta">
                <span className="social-name">WhatsApp</span>
                <span className="social-sub">+212 661 000 000</span>
              </div>
            </a>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="section-header">
            <i className="fa-solid fa-bullhorn"></i>
            <h2>À Propos de REMESS</h2>
          </div>
          
          <div className="glass-card about-card">
            <p>
              Le Réseau Marocain d'Économie Sociale et Solidaire (REMESS) est un réseau associatif de référence fondé pour fédérer les acteurs de l'Économie Sociale et Solidaire. Notre mission est de favoriser un développement durable, équitable et basé sur la solidarité.
            </p>
            
            <div className="values-grid">
              <div className="val-box"><i className="fa-solid fa-handshake"></i> <span>Solidarité</span></div>
              <div className="val-box"><i className="fa-solid fa-scale-balanced"></i> <span>Équité</span></div>
              <div className="val-box"><i className="fa-solid fa-heart-pulse"></i> <span>Inclusion</span></div>
              <div className="val-box"><i className="fa-solid fa-laptop-code"></i> <span>Innovation</span></div>
            </div>
          </div>
        </section>

        {/* Strategic Pillars / Fields of Action */}
        <section className="pillars-section">
          <div className="section-header">
            <i className="fa-solid fa-layer-group"></i>
            <h2>Axes Stratégiques</h2>
          </div>

          <div className="glass-card pillar-card">
            <div className="pillar-icon"><i className="fa-solid fa-graduation-cap"></i></div>
            <div className="pillar-text">
              <h4>Accompagnement & Renforcement</h4>
              <p>Programmes de formation en gestion, gouvernance et commercialisation pour les coopératives.</p>
            </div>
          </div>

          <div className="glass-card pillar-card">
            <div className="pillar-icon"><i className="fa-solid fa-gavel"></i></div>
            <div className="pillar-text">
              <h4>Plaidoyer Institutionnel</h4>
              <p>Défense des intérêts du secteur ESS et contribution aux politiques publiques nationales.</p>
            </div>
          </div>

          <div className="glass-card pillar-card">
            <div className="pillar-icon"><i className="fa-solid fa-network-wired"></i></div>
            <div className="pillar-text">
              <h4>Réseautage & Partenariats</h4>
              <p>Connexion des acteurs locaux aux marchés nationaux et internationaux.</p>
            </div>
          </div>

          <div className="glass-card pillar-card">
            <div className="pillar-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
            <div className="pillar-text">
              <h4>Transformation Numérique</h4>
              <p>Développement de portails web et médiathèques numériques pour le secteur.</p>
            </div>
          </div>
        </section>

        {/* Target Publics */}
        <section className="targets-section">
          <div className="section-header">
            <i className="fa-solid fa-users"></i>
            <h2>Publics Cibles</h2>
          </div>

          <div className="targets-grid">
            <div className="glass-card target-item">
              <i className="fa-solid fa-people-roof"></i>
              <h5>Coopératives & Mutuelles</h5>
            </div>
            <div className="glass-card target-item">
              <i className="fa-solid fa-hands-holding-child"></i>
              <h5>Associations du Développement</h5>
            </div>
            <div className="glass-card target-item">
              <i className="fa-solid fa-building-user"></i>
              <h5>Entreprises Sociales</h5>
            </div>
            <div className="glass-card target-item">
              <i className="fa-solid fa-person-breastfeeding"></i>
              <h5>Femmes & Jeunes</h5>
            </div>
          </div>
        </section>

        {/* Visual Gallery Section */}
        <section className="gallery-section">
          <div className="section-header">
            <i className="fa-solid fa-images"></i>
            <h2>Galerie & Initiatives</h2>
          </div>

          <div className="gallery-grid">
            <div className="glass-card gallery-card">
              <img src="/assets/cooperatives.jpg" alt="Coopératives" />
              <div className="gallery-caption">
                <span>Autonomisation des Femmes Artisanes</span>
              </div>
            </div>

            <div className="glass-card gallery-card">
              <img src="/assets/youth_entrepreneurship.jpg" alt="Entrepreneuriat" />
              <div className="gallery-caption">
                <span>Entrepreneuriat Social & Numérique</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Map Section */}
        <section className="contact-section">
          <div className="section-header">
            <i className="fa-solid fa-envelope"></i>
            <h2>Contact & Siège</h2>
          </div>

          <div className="glass-card contact-card">
            <div className="contact-list">
              <div className="contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>Avenue Fal Ould Oumeir, Agdal, Rabat - Maroc</span>
              </div>
              <div className="contact-item">
                <i className="fa-solid fa-at"></i>
                <span>contact@remess.ma</span>
              </div>
              <div className="contact-item">
                <i className="fa-solid fa-phone"></i>
                <span>+212 537 000 000</span>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <input type="text" required placeholder="Votre nom complet" />
              </div>
              <div className="form-group">
                <input type="email" required placeholder="Votre adresse E-mail" />
              </div>
              <div className="form-group">
                <textarea rows={3} required placeholder="Votre message..."></textarea>
              </div>
              <button type="submit" className="btn-submit">
                <i className="fa-solid fa-paper-plane"></i>
                <span>Envoyer le message</span>
              </button>
            </form>
          </div>
        </section>

        <footer className="footer">
          <p>© 2026 <strong>REMESS</strong> - Réseau Marocain d'Économie Sociale et Solidaire</p>
        </footer>
      </main>

      {/* Sticky Bottom Floating Action Bar for Mobile NFC Taps */}
      <div className="mobile-float-bar">
        <button className="float-btn float-btn-primary" onClick={downloadVCard}>
          <i className="fa-solid fa-address-card"></i>
          <span>Contact</span>
        </button>
        <a href="https://wa.me/212661000000" target="_blank" rel="noopener noreferrer" className="float-btn">
          <i className="fa-brands fa-whatsapp"></i>
          <span>WhatsApp</span>
        </a>
        <a href="tel:+212537000000" className="float-btn">
          <i className="fa-solid fa-phone"></i>
          <span>Appeler</span>
        </a>
        <button className="float-btn" onClick={shareCard}>
          <i className="fa-solid fa-share-nodes"></i>
          <span>Partager</span>
        </button>
      </div>

      {/* Toast Notification Container */}
      <div id="toastNotification" className={`toast-container ${showToast ? 'show' : ''}`}>
        <div className={`toast ${showToast ? 'show' : ''}`}>
          <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-gold)' }}></i>
          <span>{toastMessage}</span>
        </div>
      </div>
    </>
  );
}
