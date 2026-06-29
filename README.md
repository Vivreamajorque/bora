# Bora 🌬️

Majordome personnel — PWA mobile

## Stack
- React + Vite
- PWA (installable sur iPhone/Android)
- Claude API (Sonnet 4.6, streaming)
- Design : sombre, minimaliste

## Déploiement

### 1. Créer le repo GitHub
```bash
cd bora-app
git init
git add .
git commit -m "init: Bora PWA"
git remote add origin https://github.com/Vivreamajorque/bora.git
git push -u origin main
```

### 2. Déployer sur Vercel
- Connecter le repo sur vercel.com
- Build command : `npm run build`
- Output dir : `dist`
- Aucune variable d'environnement requise (clé API stockée localement)

### 3. Installer sur iPhone
- Ouvrir l'URL Vercel dans Safari
- Partager → Ajouter à l'écran d'accueil
- Nommer "Bora"

## Usage
Au premier lancement, entrer la clé API Anthropic (sk-ant-...).
Elle reste stockée sur l'appareil uniquement.

## Icônes
Ajouter dans /public :
- icon-192.png (192x192)
- icon-512.png (512x512)  
- apple-touch-icon.png (180x180)

Design suggéré : fond noir #0a0a0a, emoji 🌬️ centré, contour bleu #4fc3f7
