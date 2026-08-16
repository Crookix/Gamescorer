# ScoreKrew MVP

Une PWA mobile-first de comptage de scores multi-jeux.

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
- installable en PWA
- fonctionnement hors ligne après première ouverture

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
