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
  Base URL API: `/api`

En développement, `ng serve` utilise `proxy.conf.json` pour rediriger `/api/*` vers le backend local.

## Contrat HTTP

- Les réponses de succès du backend sont attendues au format `{ data, timestamp }`.
- La couche HTTP frontend retire automatiquement l’enveloppe et expose directement `data`.
- Les erreurs backend sont converties en `AppHttpError` avec un message prêt pour l’UI.
- Le bearer token est injecté automatiquement si une session valide est présente dans `ytellerie.auth_session`.
- La validité de session repose sur le JWT d’accès courant: présence du token, décodage possible et date d’expiration non dépassée.
- La déconnexion purge actuellement uniquement la session locale. Si une révocation serveur devient nécessaire, il faudra introduire une vraie stratégie de session côté backend.
- Les vues de compte affichent uniquement les informations disponibles dans les données d’authentification. Les endpoints de profil métier client/personnel restent fictifs à ce stade.

## Point CORS

Le backend Nest lit maintenant la liste d’origines autorisées depuis `CORS_ALLOWED_ORIGINS`.

- En local, le proxy Angular évite ce problème pour les appels vers `/api`.
- En intégration ou pour des appels directs depuis le navigateur, il faut renseigner l’origine réelle du frontend dans `CORS_ALLOWED_ORIGINS`.
- En Docker, le frontend Nginx reverse-proxy `/api` vers le backend, ce qui garde les appels browser en same-origin.

## Docker

```bash
cd ..
cp .env.example .env
docker compose up --build
```

## Vérification

```bash
npm run build
npm test -- --watch=false
```
