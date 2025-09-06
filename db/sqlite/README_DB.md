# Base de données locale

Ce dossier contient les scripts SQL nécessaires à l'initialisation de la base SQLite utilisée par l'application.

## Fichiers
- `001_schema.sql` : création du schéma et des triggers.
- `002_seed.sql` : insertion d'un compte administrateur par défaut.

## Application des migrations
```bash
npm run db:apply # crée/initialise mamastock.db dans le dossier courant
```

Le fichier `001_schema.sql` est idempotent : il peut être réexécuté sans casser la base. La version du schéma est stockée dans `meta.schema_version`.

## Évolution
Pour de futures migrations, incrémenter `schema_version` et ajouter un nouveau fichier `00N_description.sql`.
