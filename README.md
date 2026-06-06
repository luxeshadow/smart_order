# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
CREATE OR REPLACE FUNCTION generate_daily_orders()
RETURNS void AS $$
DECLARE
    r_user RECORD;
    v_order_id UUID;
    v_inserted_count INTEGER;
    v_total_withdrawn NUMERIC;
    v_total_deposited NUMERIC;
    v_net_profit NUMERIC;
    v_user_power NUMERIC;
    v_target_price NUMERIC;
    v_max_lucky_price NUMERIC;
BEGIN

    FOR r_user IN
        SELECT 
            u.id as user_id,
            u.main_balance,
            u.refund_balance,
            SUM(l.max_order_item)::int as total_items,
            MAX(l.max_product_price) as level_max_allowed,
            MAX(l.price) as level_entry_price
        FROM public.users u
        JOIN public.users_levels ul ON u.id = ul.user_id
        JOIN public.levels l ON ul.level_id = l.id
        GROUP BY u.id, u.main_balance, u.refund_balance
    LOOP

        -- =========================================
        -- 1. CALCUL FINANCIER
        -- =========================================
        SELECT COALESCE(SUM(amount), 0) INTO v_total_deposited
        FROM public.deposits WHERE user_id = r_user.user_id;

        SELECT COALESCE(SUM(amount), 0) INTO v_total_withdrawn
        FROM public.withdrawals 
        WHERE user_id = r_user.user_id AND status = 'completed' AND method != 'SYSTEM';

        v_net_profit := v_total_withdrawn - v_total_deposited;
        v_user_power := r_user.main_balance + r_user.refund_balance + v_total_withdrawn;

        -- =========================================
        -- 2. COMMANDE JOURNALIÈRE
        -- =========================================
        v_order_id := NULL;

        SELECT id INTO v_order_id
        FROM public.orders
        WHERE user_id = r_user.user_id AND created_at = CURRENT_DATE;

        IF v_order_id IS NULL THEN
            INSERT INTO public.orders (user_id, is_completed, created_at)
            VALUES (r_user.user_id, false, CURRENT_DATE)
            RETURNING id INTO v_order_id;
        END IF;

        -- Nettoyage anciennes commandes pending
        DELETE FROM public.order_items
        WHERE order_id = v_order_id AND status = 'pending';

        -- =========================================
        -- 3. COMMANDES NORMALES
        -- =========================================
        INSERT INTO public.order_items (
            order_id, product_id, is_lucky, price_at_purchase, 
            commission, status, created_at, position_index
        )
        SELECT
            v_order_id, x.id, false, x.price, x.price * 0.10, 'pending', now(),
            CASE WHEN row_number() OVER () = 1 THEN 0.0 ELSE random() END
        FROM (
            SELECT * FROM public.products p
            WHERE p.id NOT IN (SELECT product_id FROM public.order_items WHERE order_id = v_order_id)
            -- SÉCURITÉ : Pas de produit au-dessus du solde d'entrée pour les commandes normales
            AND p.price <= (r_user.level_entry_price * 1.10)
            ORDER BY (ABS(p.price - (CASE WHEN r_user.main_balance > 50000 THEN (r_user.main_balance * 0.35) ELSE (r_user.level_entry_price * 0.20) END)) + (random() * 500))
            LIMIT 20
        ) x
        ORDER BY random()
        LIMIT (r_user.total_items - 2);

      -- =========================================
        -- 4. LUCKY ORDERS (LOGIQUE ANTI-BRAQUAGE & RECHARGE CONTROLÉE)
        -- =========================================
        
        -- CAS 1 : Protection contre les gros soldes restés en petit niveau (ex: 200k sur Temu)
        IF r_user.main_balance > (r_user.level_entry_price * 3.0) THEN
            -- Le tricheur est détecté. On calcule une cible à 1.20x son solde actuel.
            -- De cette façon, il aura TOUJOURS un manque de 20% à recharger de sa poche, chaque jour.
            v_max_lucky_price := (r_user.main_balance * 1.20);
            
        -- CAS 2 : Utilisateur normal jouant son niveau normalement
        ELSE
            -- Si c'est le premier niveau (Temu <= 6000), on met un multiplicateur doux à 1.05
            -- pour éviter que le cumul des 2 Lucky Orders ne force une trop grosse recharge.
            IF r_user.level_entry_price <= 6000 THEN
                v_target_price := (v_user_power * 1.02);
            ELSE
                -- Pour les niveaux supérieurs (Alibaba, Shopify...), on garde le 1.20 standard
                v_target_price := (v_user_power * 1.20);
            END IF;

            IF v_net_profit > 0 THEN
                v_target_price := v_target_price + (v_net_profit * 0.5);
            END IF;

            -- Pour l'utilisateur honnête, on applique le bouclier normal de la table levels
            v_max_lucky_price := LEAST(v_target_price, r_user.level_max_allowed);
        END IF;

        INSERT INTO public.order_items (
            order_id, product_id, is_lucky, price_at_purchase, 
            commission, status, created_at, position_index
        )
        SELECT
            v_order_id, x.id, true, x.price, x.price * 0.12, 'pending', now(),
            random()
        FROM (
            SELECT * FROM public.products p
            WHERE p.id NOT IN (SELECT product_id FROM public.order_items WHERE order_id = v_order_id)
            -- On filtre les produits pour coller parfaitement à notre prix max sécurisé
            AND p.price <= v_max_lucky_price
            ORDER BY ABS(p.price - v_max_lucky_price) ASC
            LIMIT 15
        ) x
        ORDER BY random()
        LIMIT 2;

        -- =========================================
        -- 5. REMPLISSAGE DE SÉCURITÉ
        -- =========================================
        SELECT count(*) INTO v_inserted_count
        FROM public.order_items WHERE order_id = v_order_id;

        IF v_inserted_count < r_user.total_items THEN
            INSERT INTO public.order_items (
                order_id, product_id, is_lucky, price_at_purchase, 
                commission, status, created_at, position_index
            )
            SELECT
                v_order_id, p.id, false, p.price, p.price * 0.10, 'pending', now(),
                random()
            FROM public.products p
            WHERE p.id NOT IN (SELECT product_id FROM public.order_items WHERE order_id = v_order_id)
            AND p.price <= (r_user.level_entry_price * 1.10)
            ORDER BY random()
            LIMIT (r_user.total_items - v_inserted_count);
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;