# Documentation de l'Infrastructure de Base

Ce document résume l'état de l'infrastructure sur la branche `feature/infrastructure`.

## 1. Ce qui a été réalisé

La branche `feature/infrastructure` met en place une base de projet robuste et prête pour le développement des fonctionnalités.

*   **Environnement conteneurisé avec Docker :**
    *   Un `Dockerfile` multi-stage a été créé pour construire une image optimisée pour la production. Il utilise **Node.js 20** pour assurer la compatibilité avec NestJS v11.
    *   Un fichier `docker-compose.yml` orchestre les services nécessaires : `hotel-api` (l'application), `hotel-postgres` (la base de données), et `hotel-pgadmin` (l'interface de gestion BDD).
*   **Configuration externalisée :**
    *   Toutes les variables de configuration (identifiants de BDD, ports) ont été déplacées dans un fichier `.env`. Le fichier `.env.example` sert de modèle.
*   **Configuration de NestJS :**
    *   Le module `ConfigModule` est utilisé pour charger la configuration de manière centralisée depuis les variables d'environnement.
    *   `TypeOrmModule` est configuré pour se connecter à la base de données PostgreSQL en utilisant ce `ConfigService`.
*   **Fondations de l'API (Intercepteurs et Filtres globaux) :**
    *   **Validation automatique :** Un `ValidationPipe` global valide les données entrantes (DTOs).
    *   **Gestion des erreurs :** Un filtre (`AllExceptionsFilter`) intercepte toutes les erreurs et les formate dans une structure de réponse standardisée.
    *   **Formatage des réponses :** Un intercepteur (`TransformInterceptor`) enveloppe toutes les réponses réussies dans un objet `{ "data": ..., "timestamp": ... }`.
    *   **Logging :** Un intercepteur (`LoggingInterceptor`) logue les informations de base pour chaque requête.
*   **Documentation d'API :**
    *   Swagger (`OpenAPI`) est configuré et accessible sur l'endpoint `/api/docs` pour la documentation automatique de l'API.

## 2. Architecture et Patterns

L'architecture mise en place sert de fondation à l'**Architecture Hexagonale** (Ports & Adapters) prévue pour les fonctionnalités.

*   **Architecture de base :**
    *   **Modulaire (NestJS) :** L'application est structurée en modules. La configuration est centralisée dans le `AppModule`.
    *   **Couche "Common" :** Les éléments transversaux comme les filtres et intercepteurs sont placés dans `src/common`, respectant la séparation des préoccupations.

*   **Design Patterns utilisés :**
    *   **Dependency Injection (DI) :** Au cœur de NestJS, utilisé par exemple pour injecter le `ConfigService` dans la configuration de TypeORM.
    *   **Interceptor Pattern :** Utilisé pour le logging et la transformation des réponses. Cela permet de traiter les requêtes/réponses de manière transversale sans modifier la logique métier.
    *   **Filter Pattern :** Utilisé pour la gestion centralisée des erreurs (`AllExceptionsFilter`).
    *   **Configuration Object Pattern :** Le `ConfigModule` de NestJS charge la configuration et la rend disponible via un objet `ConfigService`, avec des configurations découpées par "espaces de nom" (`database`, `app`).

Cette infrastructure est conçue pour être évolutive et pour accueillir proprement les couches `domain`, `application` et `infrastructure` de l'architecture hexagonale prévue pour les modules fonctionnels comme l'authentification.
