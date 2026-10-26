import './globals.css';

export const metadata = {
  title: "REMESS - Réseau Marocain d'Économie Sociale et Solidaire",
  description: "Carte NFC Digitale officielle et plateforme d'impact du REMESS au Maroc.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" dir="ltr" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
