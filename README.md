# REMESS - Carte NFC Digitale & Hub de Contact (Next.js & Vercel Blob)

Plateforme moderne de carte de visite NFC digitale et hub de réseaux officiels pour le **Réseau Marocain d'Économie Sociale et Solidaire (REMESS)**.

---

## 🌟 Fonctionnalités Principales

- **Identité Visuelle REMESS** : Conserve le logo officiel, l'effet halo lumineux rotatif, le mode Sombre / Clair et le design glassmorphisme haut de gamme.
- **Les 7 Éléments Requis** :
  1. 📘 **Facebook** : Lien vers la page officielle et identifiant
  2. 📸 **Instagram** : Profil et compte Instagram
  3. 💼 **LinkedIn** : Page professionnelle et réseau
  4. ✉️ **EMAIL** : Action rapide d'envoi d'email et bouton Copier direct
  5. 🌐 **SITEWEB** : Accès direct au site officiel
  6. 📍 **MAPS** : Localisation du siège et itinéraire Google Maps
  7. ⭐ **REVIEWS** : Carte d'évaluation avec note 5.0 étoiles et lien pour donner un avis
- **Actions Rapides NFC** :
  - Téléchargement automatique de la fiche contact vCard (.vcf)
  - Appel téléphonique direct
  - Discussion WhatsApp directe
  - Partage de la carte via Web Share API
- **Panneau d'Administration Intégré (`/admin`)** :
  - Modifiez tous les liens, textes, coordonnées et statut d'affichage en temps réel
  - Téléversez un nouveau logo ou média directement vers **Vercel Blob**
  - Authentification par mot de passe sécurisé (par défaut : `admin`)
- **Persistance des Données avec Vercel Blob** :
  - 100% prêt pour un déploiement serveurless sur **Vercel**
  - Utilise `@vercel/blob` en production pour stocker les configurations et médias
  - Bascule automatiquement sur un stockage local en développement si le token n'est pas configuré

---

## 🚀 Démarrage Rapide en Local

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

3. Ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000).

4. Pour accéder au panneau d'administration :
   - Rendez-vous sur [http://localhost:3000/admin](http://localhost:3000/admin)
   - Mot de passe par défaut : `admin`

---

## ☁️ Déploiement sur Vercel avec Vercel Blob

1. Poussez votre code sur GitHub / GitLab.
2. Importez le projet dans votre tableau de bord **Vercel**.
3. Allez dans l'onglet **Storage** de votre projet sur Vercel :
   - Cliquez sur **Create Database**
   - Sélectionnez **Blob**
   - Associez le store Blob à votre projet (Vercel ajoutera automatiquement la variable d'environnement `BLOB_READ_WRITE_TOKEN`).
4. Déployez le projet : tout est configuré et opérationnel !
