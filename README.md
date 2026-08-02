# Smart Orders

Smart Orders est une application web Nuxt/Vue pour gérer une plateforme de commandes, de niveaux utilisateurs, de dépôts, de retraits et de commissions. L'application contient une interface client mobile-first, un tableau de bord administrateur, des intégrations de paiement, des services SMS et une assistance IA.

## Fonctionnalités principales

- Authentification utilisateur : inscription, connexion, vérification OTP, mot de passe oublié et réinitialisation.
- Profil utilisateur : consultation et mise à jour des informations du compte.
- Commandes : consultation des commandes, validation des articles de commande et gestion des commissions.
- Produits : listing des produits utilisés dans le système de commandes.
- Niveaux : gestion des niveaux, attribution de niveaux aux utilisateurs et suivi des abonnés par niveau.
- Transactions : dépôts, retraits, portefeuille, historique des transactions et remboursement vers le solde principal.
- Administration : statistiques globales, liste des utilisateurs, suivi des shops/niveaux et validation des retraits.
- Paiements : intégrations PayGate et CinetPay.
- SMS : intégrations Textbelt et KingSMS.
- Assistance IA : endpoint Gemini pour les échanges avec l'assistant.
- Mini-jeux : roulette et jeu d'avion.
- PWA : application installable avec manifest et service worker.

## Stack technique

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Supabase
- Vite PWA
- Vitest
- Chart.js
- Three.js / OGL
- Google Gemini API
- PayGate / CinetPay
- Textbelt / KingSMS

## Structure du projet

```text
smart_order/
├── app/
│   ├── core/                  # Composants partagés, constantes, utilitaires
│   ├── features/              # Modules métier organisés par domaine
│   │   ├── auth/              # Authentification
│   │   ├── egame/             # Mini-jeux
│   │   ├── level/             # Niveaux et abonnements
│   │   ├── order/             # Commandes
│   │   ├── product/           # Produits
│   │   ├── smartorder_stats/  # Statistiques plateforme
│   │   ├── transaction/       # Dépôts, retraits, wallet
│   │   └── user/              # Profil utilisateur
│   ├── middleware/            # Middlewares Nuxt
│   ├── pages/                 # Routes de l'application
│   └── services/              # Services externes: paiement, SMS, IA
├── public/                    # Assets publics et icônes PWA
├── server/api/                # Endpoints serveur Nuxt
├── nuxt.config.ts             # Configuration Nuxt
├── package.json               # Scripts et dépendances
└── vitest.config.ts           # Configuration des tests
```

## Pages principales

- `/auth/login` : connexion
- `/auth/register` : inscription
- `/auth/verify-otp` : vérification OTP
- `/home` : accueil client
- `/dashboard` : tableau de bord administrateur
- `/order/my-order` : commandes de l'utilisateur
- `/transaction/deposit` : dépôt
- `/transaction/client-withdrawal` : retrait client
- `/transaction/wallet` : portefeuille
- `/transaction/history-transaction` : historique des transactions
- `/assistance/ai` : assistance IA
- `/game/roulette-game` : jeu roulette
- `/game/plane-game` : jeu avion

## Configuration

Créer un fichier `.env` à la racine du projet avec les variables nécessaires :

```env
SUPABASE_URL=
SUPABASE_KEY=
PAYGATE_API_KEY=
CINETPAY_API_KEY=
TEXTBELT_API_KEY=
KING_SMS_API_KEY=
KING_SMS_CLIENT_ID=
SMS_PROVIDER=
GEMINI_KEY=
GEMINI_PROJECT_ID=
```

Les variables publiques Supabase et SMS sont exposées via `runtimeConfig.public`. Les clés de paiement, SMS et Gemini restent côté serveur.

## Installation

```bash
npm install
```

## Lancement en développement

```bash
npm run dev
```

Par défaut, le serveur de développement démarre sur :

```text
http://localhost:3000
```

La configuration Nuxt utilise `host: 0.0.0.0`, ce qui permet aussi de tester depuis un autre appareil sur le même réseau si le pare-feu l'autorise.

## Build production

```bash
npm run build
```

## Prévisualisation production

```bash
npm run preview
```

## Génération statique

```bash
npm run generate
```

## Tests

```bash
npx vitest
```

## Architecture métier

Le projet suit une organisation proche de la clean architecture dans plusieurs modules `features` :

- `domain` : entités et contrats de repository.
- `application` : cas d'utilisation et paramètres.
- `data` : modèles, datasources et implémentations des repositories.
- `presentation` : pages, stores, composants et validateurs.

Cette séparation permet de garder la logique métier isolée de l'interface et des services externes.

## Endpoints serveur

Les endpoints Nuxt présents dans `server/api` servent principalement de passerelles vers des services externes :

- `server/api/paygate/create.post.ts`
- `server/api/paygate/check.post.ts`
- `server/api/cinetpay/create.post.ts`
- `server/api/textbelt/send.post.ts`
- `server/api/kingsms/send.post.ts`
- `server/api/gemini/gemini.post.ts`

## Notes importantes

- Le projet dépend d'une base Supabase avec les tables métier : utilisateurs, niveaux, produits, commandes, dépôts, retraits et transactions.
- Les paiements et SMS nécessitent des clés API valides dans `.env`.
- L'application est configurée en `ssr: false`, donc elle fonctionne comme une SPA Nuxt.
- Le module PWA est activé avec mise à jour automatique du service worker.

met a jours 
DECLARE
  v_user_id UUID := auth.uid();
  v_balance NUMERIC;
  v_grid JSONB := '[]'::jsonb;
  v_items TEXT[];
  v_session_id UUID;
  r INT;
  i INT;
  j INT;
  v_temp TEXT;
BEGIN

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié.';
  END IF;


  SELECT main_balance
  INTO v_balance
  FROM public.users
  WHERE id = v_user_id
  FOR UPDATE;


  IF v_balance IS NULL OR v_balance < p_bet_amount THEN
    RAISE EXCEPTION 'Solde insuffisant.';
  END IF;


  UPDATE public.users
  SET main_balance = main_balance - p_bet_amount
  WHERE id = v_user_id;


  -- 8 lignes : 4 bombes + 2 champignons
  FOR r IN 0..7 LOOP

    v_items := ARRAY[
      'bomb',
      'bomb',
      'bomb',
      'bomb',
      'mushroom',
      'mushroom'
    ];


    -- Mélange aléatoire
    FOR i IN REVERSE 6..2 LOOP
      j := floor(random() * i) + 1;

      v_temp := v_items[i];
      v_items[i] := v_items[j];
      v_items[j] := v_temp;
    END LOOP;


    -- Ajoute une ligne de 6 cases
    v_grid := jsonb_insert(
      v_grid,
      ARRAY[r::text],
      to_jsonb(v_items),
      true
    );

  END LOOP;


  INSERT INTO public.game_sessions (
    user_id,
    bet_amount,
    current_level,
    grid,
    status
  )
  VALUES (
    v_user_id,
    p_bet_amount,
    0,
    v_grid,
    'IN_PROGRESS'
  )
  RETURNING id INTO v_session_id;


  RETURN jsonb_build_object(
    'session_id',
    v_session_id,
    'new_balance',
    v_balance - p_bet_amount
  );

END;