# 🌍 EcoSpy - Mission Climat

Escape Game numérique éducatif (multijoueur 2–4 joueurs) réalisé pour le Workshop M1 2025‑2026 (EPSI/WIS).

## 🎯 Objectifs
- Sensibiliser aux enjeux environnementaux via 4 énigmes ludo‑pédagogiques
- Collaboration temps réel (chat textuel) et compte à rebours (30 min)
- Stack moderne: React + Vite (front), Node.js + Express + Socket.io (back)

## 📦 Installation rapide
```bash
# Backend
cd server
npm install
npm start   # http://localhost:5000/health

# Frontend
cd ../client
npm install
npm run dev # http://localhost:3000
```

## 🎮 Utilisation
1. Ouvrez http://localhost:3000
2. Créez une partie, partagez le code à 6 caractères
3. Les autres joueurs rejoignent avec ce code
4. L’hôte lance la mission; résolvez les 4 salles avant la fin du temps

## 🧩 Les 4 énigmes
1. Empreinte Carbone — calcul interactif (logique et chiffres clé)
2. Océan Pollué — memory game (décomposition des déchets)
3. Déforestation — identification de la région critique (coopération via chat)
4. Mix Énergétique — optimisation avec curseurs (renouvelables ≥ 60%)

## 🏗️ Architecture
- Frontend: React 18, React Router, TailwindCSS, Framer Motion (animations), Socket.io‑client
- Backend: Node.js, Express, Socket.io, Helmet, CORS
- Communication: HTTP + WebSocket (events: create/join/start/submit/chat)

Dossiers principaux:
```
client/     # Interface de jeu (React)
server/     # API + Socket.io (Express)
docs/       # Documentation & livrables
```

## 🔐 Sécurité & données
- Aucune donnée personnelle stockée (noms affichés en mémoire volatile)
- Validation des réponses côté serveur
- Headers de sécurité via Helmet, CORS restreint au front en dev

## 🧪 Débogage
- Backend: /health → { status:"OK", rooms, players }
- Frontend: F12 Console pour voir les events Socket.io

## 🚢 Déploiement (suggestion)
- Frontend: Vercel/Netlify
- Backend: Render/Railway/Fly.io
- Variables utiles (server/.env):
```
PORT=5000
CLIENT_URL=http://localhost:3000
```

## 📝 Livrables Workshop
- docs/rapport-technique.md (modèle)
- docs/poster-A3.md (modèle)
- docs/presentation-outline.md (trame PPT)
- SUMMARY.md (résumé exécutif)
- STATUS.md (état & planning)
- INDEX.md (index des fichiers)


Bonne mission ! 🚀
