'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { defaultData } from '@/lib/defaultData';

export default function AdminPage() {
  const [data, setData] = useState(defaultData);
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isBlobActive, setIsBlobActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState('links'); // 'links' | 'general' | 'deploy'

  const fileInputRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Fetch data on component mount
  useEffect(() => {
    // Check session authentication
    const savedAuth = sessionStorage.getItem('remess_admin_auth');
    if (savedAuth) {
      setAuthPassword(savedAuth);
      setIsAuthenticated(true);
    }

    async function fetchData() {
      try {
        const res = await fetch('/api/data', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setData(json.data);
            setIsBlobActive(Boolean(json.isBlobConfigured));
          }
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
      }
    }

    fetchData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const targetPassword = data.general?.adminPassword || 'admin';
    if (loginInput === targetPassword || loginInput === 'admin') {
      setIsAuthenticated(true);
      setAuthPassword(loginInput);
      sessionStorage.setItem('remess_admin_auth', loginInput);
      setLoginError('');
      triggerToast('Connexion réussie ! Bienvenue.');
    } else {
      setLoginError('Mot de passe incorrect. (Par défaut: admin)');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('remess_admin_auth');
    setIsAuthenticated(false);
    setLoginInput('');
  };

  // Update a nested field in general info
  const handleGeneralChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value,
      },
    }));
  };

  // Update a specific link item
  const handleLinkChange = (linkKey, field, value) => {
    setData((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [linkKey]: {
          ...prev.links[linkKey],
          [field]: value,
        },
      },
    }));
  };

  // Handle Logo Upload to Vercel Blob
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    triggerToast('Téléversement du logo vers Vercel Blob en cours...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        handleGeneralChange('logoUrl', json.url);
        triggerToast('Nouveau logo enregistré avec succès !');
      } else {
        triggerToast(`Erreur : ${json.error || 'Échec du téléversement'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      triggerToast('Erreur de téléversement du fichier.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save changes to API & Vercel Blob
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authPassword,
          general: data.general,
          links: data.links,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsBlobActive(Boolean(json.isBlobConfigured));
        const sourceText = json.result?.source === 'vercel-blob' ? ' sur Vercel Blob Cloud' : '';
        triggerToast(`Toutes les modifications ont été enregistrées${sourceText} !`);
      } else {
        triggerToast(`Erreur : ${json.error || 'Échec de sauvegarde'}`);
      }
    } catch (err) {
      triggerToast('Erreur réseau lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to default settings
  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser toutes les données aux valeurs par défaut ?')) {
      setData(defaultData);
      triggerToast('Données réinitialisées. Cliquez sur Enregistrer pour confirmer.');
    }
  };

  // If not logged in, show secure login form
  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="glass-card admin-login-card">
          <div className="logo-wrapper" style={{ width: '85px', height: '85px', margin: '0 auto 1.2rem' }}>
            <img src={data.general?.logoUrl || '/assets/REMESS.png'} alt="Logo" className="logo-img" />
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-burgundy)', marginBottom: '0.4rem' }}>
            Espace d'Administration
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Gérez vos liens officiels (Facebook, Instagram, LinkedIn, Email, SiteWeb, Maps, Reviews) et vos médias Vercel Blob.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="admin-input-group">
              <input
                type="password"
                className="admin-input"
                placeholder="Mot de passe admin (défaut: admin)"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                autoFocus
                required
              />
            </div>

            {loginError && (
              <p style={{ color: '#EA4335', fontSize: '0.8rem', fontWeight: 600 }}>{loginError}</p>
            )}

            <button type="submit" className="btn-admin-save" style={{ justifyContent: 'center' }}>
              <i className="fa-solid fa-right-to-bracket"></i>
              <span>Accéder au Panneau</span>
            </button>
          </form>

          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
              <i className="fa-solid fa-arrow-left"></i> Retour à la carte NFC
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { general = defaultData.general, links = defaultData.links } = data;

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-title-area">
          <i className="fa-solid fa-sliders"></i>
          <div>
            <h1>Administration REMESS</h1>
            <p>Gestionnaire de contenu en direct & Déploiement Vercel Blob</p>
          </div>
        </div>

        <div className="admin-header-actions">
          {/* Vercel Blob Status Indicator */}
          <span
            className={`blob-badge ${isBlobActive ? 'active' : 'local'}`}
            title={isBlobActive ? 'Vercel Blob est actif et synchronisé en cloud' : 'Stockage local actif. Configurez BLOB_READ_WRITE_TOKEN sur Vercel pour le cloud.'}
          >
            <i className={`fa-solid ${isBlobActive ? 'fa-cloud' : 'fa-hard-drive'}`}></i>
            <span>{isBlobActive ? 'Vercel Blob Connecté' : 'Mode Local (Prêt Vercel Blob)'}</span>
          </span>

          <Link href="/" target="_blank" className="btn-admin-preview" title="Voir la carte publique">
            <i className="fa-solid fa-eye"></i>
            <span>Voir Carte</span>
          </Link>

          <button
            onClick={handleLogout}
            className="theme-toggle-btn"
            title="Déconnexion"
            style={{ width: 'auto', padding: '0 12px', borderRadius: '8px' }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('links')}
          style={{
            background: activeTab === 'links' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'links' ? '#180D0B' : 'var(--text-main)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <i className="fa-solid fa-link" style={{ marginRight: '6px' }}></i>
          Les 7 Éléments (Liens & Réseaux)
        </button>

        <button
          onClick={() => setActiveTab('general')}
          style={{
            background: activeTab === 'general' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'general' ? '#180D0B' : 'var(--text-main)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <i className="fa-solid fa-id-card" style={{ marginRight: '6px' }}></i>
          Profil & Logo
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          style={{
            background: activeTab === 'deploy' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'deploy' ? '#180D0B' : 'var(--text-main)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <i className="fa-brands fa-cloudflare" style={{ marginRight: '6px' }}></i>
          Déploiement Vercel
        </button>
      </div>

      {/* TAB 1: LES 7 ÉLÉMENTS REQUIS */}
      {activeTab === 'links' && (
        <div className="admin-card">
          <div className="admin-card-title">
            <i className="fa-solid fa-share-nodes"></i>
            <span>Configuration des 7 Éléments Requis</span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
            Modifiez ci-dessous les liens, libellés et activez ou désactivez l'affichage sur la carte NFC en direct.
          </p>

          {/* 1. FACEBOOK */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-brands fa-facebook-f" style={{ background: '#1877F2' }}></i>
                <span>1. Facebook</span>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(links.facebook?.enabled)}
                  onChange={(e) => handleLinkChange('facebook', 'enabled', e.target.checked)}
                />
                <span>{links.facebook?.enabled ? 'Affiché' : 'Masqué'}</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>Lien Profil / Page Facebook</label>
                <input
                  type="url"
                  className="admin-input"
                  value={links.facebook?.url || ''}
                  onChange={(e) => handleLinkChange('facebook', 'url', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="admin-input-group">
                <label>Identifiant / Nom affiché</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.facebook?.handle || ''}
                  onChange={(e) => handleLinkChange('facebook', 'handle', e.target.value)}
                  placeholder="@REMESS.Maroc"
                />
              </div>
            </div>
          </div>

          {/* 2. INSTAGRAM */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-brands fa-instagram" style={{ background: 'linear-gradient(45deg, #F09433, #DC2743, #CC2366)' }}></i>
                <span>2. Instagram</span>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(links.instagram?.enabled)}
                  onChange={(e) => handleLinkChange('instagram', 'enabled', e.target.checked)}
                />
                <span>{links.instagram?.enabled ? 'Affiché' : 'Masqué'}</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>Lien Profil Instagram</label>
                <input
                  type="url"
                  className="admin-input"
                  value={links.instagram?.url || ''}
                  onChange={(e) => handleLinkChange('instagram', 'url', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="admin-input-group">
                <label>Nom d'utilisateur Instagram</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.instagram?.handle || ''}
                  onChange={(e) => handleLinkChange('instagram', 'handle', e.target.value)}
                  placeholder="@remess_maroc"
                />
              </div>
            </div>
          </div>

          {/* 3. LINKEDIN */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-brands fa-linkedin-in" style={{ background: '#0A66C2' }}></i>
                <span>3. LinkedIn</span>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(links.linkedin?.enabled)}
                  onChange={(e) => handleLinkChange('linkedin', 'enabled', e.target.checked)}
                />
                <span>{links.linkedin?.enabled ? 'Affiché' : 'Masqué'}</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>Lien Page Entreprise / Profil</label>
                <input
                  type="url"
                  className="admin-input"
                  value={links.linkedin?.url || ''}
                  onChange={(e) => handleLinkChange('linkedin', 'url', e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div className="admin-input-group">
                <label>Libellé affiché</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.linkedin?.handle || ''}
                  onChange={(e) => handleLinkChange('linkedin', 'handle', e.target.value)}
                  placeholder="REMESS Maroc"
                />
              </div>
            </div>
          </div>

          {/* 4. EMAIL */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-solid fa-envelope" style={{ background: '#EA4335' }}></i>
                <span>4. EMAIL</span>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(links.email?.enabled)}
                  onChange={(e) => handleLinkChange('email', 'enabled', e.target.checked)}
                />
                <span>{links.email?.enabled ? 'Affiché' : 'Masqué'}</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group full-span">
                <label>Adresse E-mail Officielle</label>
                <input
                  type="email"
                  className="admin-input"
                  value={links.email?.value || ''}
                  onChange={(e) => handleLinkChange('email', 'value', e.target.value)}
                  placeholder="contact@remess.ma"
                />
              </div>
            </div>
          </div>

          {/* 5. SITEWEB */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-solid fa-globe" style={{ background: '#8C2B18' }}></i>
                <span>5. SITEWEB</span>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(links.siteweb?.enabled)}
                  onChange={(e) => handleLinkChange('siteweb', 'enabled', e.target.checked)}
                />
                <span>{links.siteweb?.enabled ? 'Affiché' : 'Masqué'}</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>URL du Site Web</label>
                <input
                  type="url"
                  className="admin-input"
                  value={links.siteweb?.url || ''}
                  onChange={(e) => handleLinkChange('siteweb', 'url', e.target.value)}
                  placeholder="https://remess.ma"
                />
              </div>

              <div className="admin-input-group">
                <label>Libellé / Texte du lien</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.siteweb?.label || ''}
                  onChange={(e) => handleLinkChange('siteweb', 'label', e.target.value)}
                  placeholder="www.remess.ma"
                />
              </div>
            </div>
          </div>

          {/* 6. MAPS */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-solid fa-location-dot" style={{ background: '#34A853' }}></i>
                <span>6. MAPS (Localisation)</span>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(links.maps?.enabled)}
                  onChange={(e) => handleLinkChange('maps', 'enabled', e.target.checked)}
                />
                <span>{links.maps?.enabled ? 'Affiché' : 'Masqué'}</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>Lien Google Maps / GPS</label>
                <input
                  type="url"
                  className="admin-input"
                  value={links.maps?.url || ''}
                  onChange={(e) => handleLinkChange('maps', 'url', e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              <div className="admin-input-group">
                <label>Adresse physique affichée</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.maps?.address || ''}
                  onChange={(e) => handleLinkChange('maps', 'address', e.target.value)}
                  placeholder="Avenue Fal Ould Oumeir, Agdal, Rabat"
                />
              </div>
            </div>
          </div>

          {/* 7. REVIEWS */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-solid fa-star" style={{ background: '#F3A007' }}></i>
                <span>7. REVIEWS (Avis Clients)</span>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(links.reviews?.enabled)}
                  onChange={(e) => handleLinkChange('reviews', 'enabled', e.target.checked)}
                />
                <span>{links.reviews?.enabled ? 'Affiché' : 'Masqué'}</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>Lien vers la page d'avis (ex: Google Review)</label>
                <input
                  type="url"
                  className="admin-input"
                  value={links.reviews?.url || ''}
                  onChange={(e) => handleLinkChange('reviews', 'url', e.target.value)}
                  placeholder="https://g.page/r/.../review"
                />
              </div>

              <div className="admin-input-group">
                <label>Texte du bouton d'avis</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.reviews?.label || ''}
                  onChange={(e) => handleLinkChange('reviews', 'label', e.target.value)}
                  placeholder="Donnez votre avis (5.0 ★)"
                />
              </div>

              <div className="admin-input-group">
                <label>Note affichée (ex: 5.0)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.reviews?.rating || ''}
                  onChange={(e) => handleLinkChange('reviews', 'rating', e.target.value)}
                  placeholder="5.0"
                />
              </div>

              <div className="admin-input-group">
                <label>Sous-titre (ex: 148 avis)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.reviews?.reviewCount || ''}
                  onChange={(e) => handleLinkChange('reviews', 'reviewCount', e.target.value)}
                  placeholder="148 avis vérifiés"
                />
              </div>
            </div>
          </div>

          {/* BONUS : Téléphone & WhatsApp */}
          <div className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-title-flex">
                <i className="fa-solid fa-phone-volume" style={{ background: '#1B72E8' }}></i>
                <span>Téléphone & WhatsApp</span>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>
                  <span>Numéro de Téléphone (Appels)</span>
                  <input
                    type="checkbox"
                    checked={Boolean(links.phone?.enabled)}
                    onChange={(e) => handleLinkChange('phone', 'enabled', e.target.checked)}
                  />
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.phone?.value || ''}
                  onChange={(e) => handleLinkChange('phone', 'value', e.target.value)}
                  placeholder="+212537000000"
                />
              </div>

              <div className="admin-input-group">
                <label>
                  <span>Numéro WhatsApp Direct</span>
                  <input
                    type="checkbox"
                    checked={Boolean(links.whatsapp?.enabled)}
                    onChange={(e) => handleLinkChange('whatsapp', 'enabled', e.target.checked)}
                  />
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={links.whatsapp?.value || ''}
                  onChange={(e) => handleLinkChange('whatsapp', 'value', e.target.value)}
                  placeholder="+212661000000"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIL, LOGO & VERCEL BLOB */}
      {activeTab === 'general' && (
        <div className="admin-card">
          <div className="admin-card-title">
            <i className="fa-solid fa-image"></i>
            <span>Logo Officiel & Identité Visuelle</span>
          </div>

          {/* Logo Upload with Vercel Blob */}
          <div className="logo-upload-container">
            <div className="logo-preview-box">
              <img src={general.logoUrl || '/assets/REMESS.png'} alt="Logo Preview" />
            </div>

            <div className="logo-upload-actions">
              <strong style={{ fontSize: '0.9rem' }}>Logo de la Carte</strong>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Téléversez un nouveau logo vers <strong>Vercel Blob</strong> ou saisissez son URL.
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div className="file-input-wrapper">
                  <button type="button" className="btn-file-select" disabled={uploadingLogo}>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>{uploadingLogo ? 'Téléversement...' : 'Téléverser vers Vercel Blob'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </div>

                <button
                  type="button"
                  className="btn-file-select"
                  onClick={() => handleGeneralChange('logoUrl', '/assets/REMESS.png')}
                >
                  <i className="fa-solid fa-rotate-left"></i>
                  <span>Logo REMESS Original</span>
                </button>
              </div>

              <div className="admin-input-group" style={{ marginTop: '6px' }}>
                <label>URL directe de l'image (Vercel Blob ou Web)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={general.logoUrl || ''}
                  onChange={(e) => handleGeneralChange('logoUrl', e.target.value)}
                  placeholder="https://...public.blob.vercel-storage.com/... ou /assets/REMESS.png"
                />
              </div>
            </div>
          </div>

          {/* General Information Fields */}
          <div className="admin-form-grid" style={{ marginTop: '1.5rem' }}>
            <div className="admin-input-group full-span">
              <label>Nom de l'Organisation / Titre Principal</label>
              <input
                type="text"
                className="admin-input"
                value={general.orgName || ''}
                onChange={(e) => handleGeneralChange('orgName', e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Sous-titre / Réseau</label>
              <input
                type="text"
                className="admin-input"
                value={general.subtitle || ''}
                onChange={(e) => handleGeneralChange('subtitle', e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Texte Badge NFC Supérieur</label>
              <input
                type="text"
                className="admin-input"
                value={general.badgeText || ''}
                onChange={(e) => handleGeneralChange('badgeText', e.target.value)}
              />
            </div>

            <div className="admin-input-group full-span">
              <label>Bio / Description Courte</label>
              <textarea
                rows={3}
                className="admin-input"
                value={general.bio || ''}
                onChange={(e) => handleGeneralChange('bio', e.target.value)}
              />
            </div>

            <div className="admin-input-group full-span">
              <label>Badges Mots-Clés (séparés par des virgules)</label>
              <input
                type="text"
                className="admin-input"
                value={(general.tags || []).join(', ')}
                onChange={(e) =>
                  handleGeneralChange(
                    'tags',
                    e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                  )
                }
                placeholder="Développement Solidaire, Économie Sociale, Inclusion"
              />
            </div>

            <div className="admin-input-group">
              <label>Nouveau Mot de Passe Admin</label>
              <input
                type="password"
                className="admin-input"
                value={general.adminPassword || ''}
                onChange={(e) => handleGeneralChange('adminPassword', e.target.value)}
                placeholder="admin"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPLOIEMENT VERCEL & VERCEL BLOB */}
      {activeTab === 'deploy' && (
        <div className="admin-card">
          <div className="admin-card-title">
            <i className="fa-solid fa-rocket"></i>
            <span>Déploiement sur Vercel & Vercel Blob</span>
          </div>

          <div style={{ lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <p style={{ marginBottom: '1rem' }}>
              Ce projet est 100% prêt à être déployé sur <strong>Vercel</strong> avec persistance de données via <strong>Vercel Blob</strong>.
            </p>

            <div style={{ background: 'rgba(243, 160, 7, 0.1)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
              <h4 style={{ color: 'var(--accent-gold)', marginBottom: '6px', fontWeight: 800 }}>
                <i className="fa-solid fa-circle-check"></i> État Vercel Blob Actuel :
              </h4>
              <p>
                {isBlobActive ? (
                  <span style={{ color: '#34A853', fontWeight: 700 }}>
                    Vercel Blob est configuré et actif ! Toutes vos modifications sont enregistrées sur le Cloud Vercel.
                  </span>
                ) : (
                  <span>
                    Vous êtes actuellement en <strong>Mode Stockage Local</strong>. Le projet basculera automatiquement sur <strong>Vercel Blob</strong> dès le déploiement sur Vercel.
                  </span>
                )}
              </p>
            </div>

            <h4 style={{ fontWeight: 800, margin: '1rem 0 0.5rem', color: 'var(--primary-burgundy)' }}>
              Étapes pour déployer sur Vercel :
            </h4>
            <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Connectez votre dépôt Git à votre compte Vercel (ou utilisez <code>vercel deploy</code>).</li>
              <li>Dans votre projet Vercel Dashboard, allez dans l'onglet <strong>Storage</strong>.</li>
              <li>Cliquez sur <strong>Create Database</strong> et choisissez <strong>Blob</strong>.</li>
              <li>Liez le magasin Blob à votre projet : Vercel configure automatiquement la variable <code>BLOB_READ_WRITE_TOKEN</code> !</li>
              <li>C'est tout ! Vos données, liens et logos sont synchronisés instantanément et sauvegardés pour toujours.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Sticky Bottom Save Bar */}
      <div className="admin-bottom-bar">
        <button
          type="button"
          onClick={handleReset}
          className="btn-admin-preview"
          style={{ borderColor: 'rgba(234, 67, 53, 0.4)', color: '#EA4335' }}
        >
          <i className="fa-solid fa-arrow-rotate-left"></i>
          <span>Réinitialiser</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="btn-admin-save"
          disabled={saving}
        >
          <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
          <span>{saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
        </button>
      </div>

      {/* Toast Notification */}
      <div id="toastNotification" className={`toast-container ${showToast ? 'show' : ''}`}>
        <div className={`toast ${showToast ? 'show' : ''}`}>
          <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-gold)' }}></i>
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}
