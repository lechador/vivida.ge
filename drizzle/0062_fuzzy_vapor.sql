CREATE INDEX "credit_tx_user_reason_ref_idx" ON "credit_transaction" USING btree ("user_id","reason","ref");
--> statement-breakpoint
CREATE OR REPLACE FUNCTION vivida_spend_credits_once(
	p_user_id text,
	p_cost integer,
	p_reason text,
	p_ref text,
	p_transaction_id text
)
RETURNS TABLE(result_status text, resulting_balance integer)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
	v_balance integer;
BEGIN
	IF p_cost < 0 THEN
		RAISE EXCEPTION 'credit cost cannot be negative';
	END IF;

	-- Serialize idempotent wallet operations for this user. The lock lives only
	-- for this function call/transaction and works even before an account exists.
	PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

	SELECT ca.balance
	INTO v_balance
	FROM credit_account AS ca
	WHERE ca.user_id = p_user_id;

	IF EXISTS (
		SELECT 1
		FROM credit_transaction AS ct
		WHERE ct.user_id = p_user_id
			AND ct.reason = p_reason
			AND ct.ref = p_ref
	) THEN
		result_status := 'already';
		resulting_balance := COALESCE(v_balance, 0);
		RETURN NEXT;
		RETURN;
	END IF;

	IF p_cost = 0 THEN
		INSERT INTO credit_transaction (id, user_id, amount, reason, ref)
		VALUES (p_transaction_id, p_user_id, 0, p_reason, p_ref);
		result_status := 'unlocked';
		resulting_balance := COALESCE(v_balance, 0);
		RETURN NEXT;
		RETURN;
	END IF;

	UPDATE credit_account AS ca
	SET balance = ca.balance - p_cost,
		updated_at = now()
	WHERE ca.user_id = p_user_id
		AND ca.balance >= p_cost
	RETURNING ca.balance INTO v_balance;

	IF NOT FOUND THEN
		result_status := 'insufficient';
		resulting_balance := COALESCE(v_balance, 0);
		RETURN NEXT;
		RETURN;
	END IF;

	INSERT INTO credit_transaction (id, user_id, amount, reason, ref)
	VALUES (p_transaction_id, p_user_id, -p_cost, p_reason, p_ref);

	result_status := 'unlocked';
	resulting_balance := v_balance;
	RETURN NEXT;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION vivida_grant_purchase_credits(
	p_user_id text,
	p_amount integer,
	p_session_id text,
	p_transaction_id text
)
RETURNS TABLE(was_granted boolean, resulting_balance integer)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
	v_balance integer;
BEGIN
	IF p_amount <= 0 THEN
		was_granted := false;
		resulting_balance := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

	IF EXISTS (
		SELECT 1
		FROM credit_transaction AS ct
		WHERE ct.user_id = p_user_id
			AND ct.reason = 'purchase'
			AND ct.ref = p_session_id
	) THEN
		SELECT ca.balance
		INTO v_balance
		FROM credit_account AS ca
		WHERE ca.user_id = p_user_id;
		was_granted := false;
		resulting_balance := COALESCE(v_balance, 0);
		RETURN NEXT;
		RETURN;
	END IF;

	INSERT INTO credit_account (user_id, balance, updated_at)
	VALUES (p_user_id, p_amount, now())
	ON CONFLICT (user_id) DO UPDATE
	SET balance = credit_account.balance + EXCLUDED.balance,
		updated_at = now()
	RETURNING credit_account.balance INTO v_balance;

	INSERT INTO credit_transaction (id, user_id, amount, reason, ref)
	VALUES (p_transaction_id, p_user_id, p_amount, 'purchase', p_session_id);

	was_granted := true;
	resulting_balance := v_balance;
	RETURN NEXT;
END;
$$;
