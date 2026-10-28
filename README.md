# Flip 7

Une PWA mobile-first de comptage de scores pour Flip 7 (et quelques autres jeux).

## Jeux inclus
- Flip 7
- Skyjo
- 6 qui prend !
- Score libre

## Fonctions
- joueurs mémorisés localement
- manches et scores cumulés
- règles de fin de partie par jeu
- bonus Flip 7 / joueur sauté
- règle du joueur qui ferme sur Skyjo
- historique local
- classement final
- installable en PWA (« Ajouter à l’écran d’accueil » sur iOS, « Installer l’application » sur Android/Chrome)
- fonctionnement hors ligne après première ouverture

## PWA
- `manifest.webmanifest` : nom, icônes (dont une icône *maskable*), mode `standalone`.
- `sw.js` : service worker *network-first* — en ligne, les fichiers sont toujours rechargés depuis le serveur ; hors ligne, le cache prend le relais. Pour changer la liste des fichiers mis en cache, incrémenter `CACHE`.
- Le service worker nécessite HTTPS (ou `localhost`).

## Lancer en local
Le projet n'a aucune dépendance.

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Déploiement
Le dossier peut être déployé tel quel sur Vercel, Netlify, GitHub Pages ou n'importe quel hébergeur statique.

## Architecture
Le MVP utilise volontairement `localStorage` et du JavaScript sans framework pour être immédiatement testable. Pour une V2 multi-appareils : migration React/Next.js + Supabase, comptes facultatifs, groupes d'amis et statistiques avancées.
