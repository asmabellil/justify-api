# Justify API

API REST pour la [justification de texte](https://fr.wikipedia.org/wiki/Justification_(typographie)) avec authentification par token et rate limiting.

## Conformité aux Exigences

Cette API répond à **toutes les exigences** spécifiées :

- ✅ **Justification de texte** - Lignes de 80 caractères, sans bibliothèque externe
- ✅ **Endpoint /api/justify** - POST avec ContentType text/plain
- ✅ **Authentification par token** - Tokens uniques via /api/token
- ✅ **Rate Limiting** - 80 000 mots par jour et par token, erreur 402 Payment Required
- ✅ **Code déployé** - URL publique sur Render
- ✅ **Repository GitHub** - Code source disponible
- ✅ **Node.js + TypeScript** - Entièrement typé avec NestJS 11
- ✅ **Aucune bibliothèque externe** - Algorithme de justification custom

## Bonus Implémentés

- ✅ **Tests** - Coverage complet avec Jest (tests unitaires + E2E)
- ✅ **Documentation** - README détaillé + Swagger interactif sur `/api-docs`
- ✅ **Code propre** - Architecture modulaire, commits clairs
- ✅ **Sécurité** - Tokens générés avec crypto.randomBytes, nettoyage automatique

## 📋 Table des matières

- [Installation](#installation)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Documentation Swagger](#documentation-swagger)

## 🛠️ Installation

```bash
# Cloner le repository
git clone https://github.com/asmabellil/justify-api
cd justify-api

# Installer les dépendances
npm install

# Lancer en mode développement
npm run start:dev
```

L'API sera accessible sur `http://localhost:3000`

## 📖 Utilisation

### 1. Obtenir un token

```bash
curl -X POST http://localhost:3000/api/token \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Réponse:**
```json
{
  "token": "Bearer a1b2c3d4e5f6789..."
}
```

> Note: Le token est un identifiant unique généré avec crypto.randomBytes.

### 2. Justifier un texte

```bash
curl -X POST http://localhost:3000/api/justify \
  -H "Content-Type: text/plain" \
  -H "Authorization: VOTRE_TOKEN" \
  -d "Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n'avais pas le temps de me dire: Je m'endors."
```

**Réponse:**
```
Longtemps,  je  me  suis  couché  de  bonne heure. Parfois, à peine ma
bougie  éteinte,  mes  yeux  se  fermaient  si  vite  que je n'avais pas
le temps de me dire: Je m'endors.
```

## 🌐 API Endpoints

### `POST /api/token`

Génère un token d'authentification unique.

- **Body:** `application/json`
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Réponse:** `200 OK`
  ```json
  {
    "token": "Bearer a1b2c3d4e5f6789..."
  }
  ```
  > Token unique généré avec crypto.randomBytes (64 caractères hex)
- **Erreurs:**
  - `400 Bad Request` - Email invalide

### `POST /api/justify`

Justifie un texte avec des lignes de 80 caractères.

- **Headers:**
  - `Content-Type: text/plain`
  - `Authorization: Bearer <token>`
- **Body:** Texte brut à justifier
- **Réponse:** `200 OK` - Texte justifié (text/plain)
- **Erreurs:**
  - `400 Bad Request` - Texte invalide ou mot > 80 caractères
  - `401 Unauthorized` - Token manquant ou invalide
  - `402 Payment Required` - Limite de 80 000 mots/jour dépassée

## 🧪 Tests

### Lancer tous les tests

```bash
npm test
```

**Résultat attendu:**
```
Test Suites: 3 passed, 3 total
Tests:       10 passed, 10 total
```

### Tests avec coverage

```bash
npm run test:cov
```

### Tests en mode watch

```bash
npm run test:watch
```

### Tests end-to-end

```bash
npm run test:e2e
```

## 📊 Structure des Tests

- **auth.service.spec.ts** - Tests de génération et validation de tokens
- **justify.service.spec.ts** - Tests de justification et rate limiting
  - ✅ Justification correcte (lignes ≤ 80 caractères)
  - ✅ Gestion des mots dépassant 80 caractères
  - ✅ Rate limiting (erreur 402 après 80 000 mots)
  - ✅ Reset quotidien du compteur
  - ✅ Préservation des paragraphes
  - ✅ Comptage précis des mots
- **app.controller.spec.ts** - Tests de base

## 🚀 Déploiement

### Render

**Notre API est disponible sur:** `https://justify-api-1.onrender.com/`

## Documentation Swagger

Une fois l'application lancée, accédez à la documentation interactive Swagger:

```
http://localhost:3000/api-docs
```

Swagger vous permet de:
- Explorer tous les endpoints
- Tester l'API directement depuis le navigateur
- Voir les schémas de requêtes/réponses
- Tester l'authentification Bearer

## 🏗️ Architecture

```
src/
├── auth/                    # Module d'authentification
│   ├── auth.controller.ts   # Endpoint POST /api/token
│   ├── auth.service.ts      # Logique de génération de tokens
│   └── dto/                 # Data Transfer Objects
├── justify/                 # Module de justification
│   ├── justify.controller.ts # Endpoint POST /api/justify
│   └── justify.service.ts   # Algorithme de justification + rate limiting
├── common/                  # Éléments partagés
│   ├── decorators/          # @Public() decorator
│   └── guards/              # AuthGuard global
└── main.ts                  # Point d'entrée + config Swagger
```

## Sécurité et Limites

- **Tokens:** Générés avec crypto.randomBytes(32) - 64 caractères hexadécimaux
- **Nettoyage:** Les tokens de plus de 24h sont supprimés automatiquement
- **Validation:** AuthGuard global sur toutes les routes protégées
- **Rate Limiting:** 80 000 mots par token et par jour (reset à minuit)

## 🛠️ Scripts Disponibles

```bash
npm run start          # Lancer en mode production
npm run start:dev      # Mode développement (watch)
npm run start:debug    # Mode debug
npm run build          # Compiler TypeScript
npm test               # Tests unitaires
npm run test:cov       # Tests avec coverage
npm run test:e2e       # Tests end-to-end
```

**Documentation Swagger:** `/api-docs`
**Version:** 1.0.0
**Node:** >= 20.11
**Framework:** NestJS 11.x
**Authentification:** Bearer tokens (crypto.randomBytes)
