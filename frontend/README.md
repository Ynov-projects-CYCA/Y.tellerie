# Frontend

Socle Angular du frontend Y.tellerie.

## Démarrage

```bash
npm start
```

Le serveur Angular écoute sur `http://localhost:4200`.

## Environnements

- `src/environments/environment.development.ts`
  Base URL API: `/api`
- `src/environments/environment.ts`
  Base URL API: `http://localhost:3000`

En développement, `ng serve` utilise `proxy.conf.json` pour rediriger `/api/*` vers le backend local.

## Contrat HTTP

- Les réponses de succès du backend sont attendues au format `{ data, timestamp }`.
- La couche HTTP frontend retire automatiquement l’enveloppe et expose directement `data`.
- Les erreurs backend sont converties en `AppHttpError` avec un message prêt pour l’UI.
- Le bearer token est injecté automatiquement si `ytellerie.access_token` est présent dans le stockage local.

## Point CORS

Le backend Nest active actuellement CORS uniquement pour `http://localhost:3000`.

- En local, le proxy Angular évite ce problème pour les appels vers `/api`.
- En intégration ou pour des appels directs depuis le navigateur, le backend devra autoriser l’origine réelle du frontend, par exemple `http://localhost:4200` ou le domaine d’intégration.
- Alternative acceptable: placer frontend et backend derrière un reverse proxy en same-origin.

## Vérification

```bash
npm run build
npm test -- --watch=false
```
