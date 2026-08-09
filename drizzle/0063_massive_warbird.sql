ALTER TABLE "user_activity_day" ADD COLUMN "ritual_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_activity_day" ADD COLUMN "ritual_version" integer;--> statement-breakpoint
-- Preserve every existing user's earned streak at rollout. New activity rows
-- remain NULL until the user completes the actual daily ritual.
UPDATE "user_activity_day"
SET
	"ritual_completed_at" = "first_seen_at",
	"ritual_version" = 0
WHERE "ritual_completed_at" IS NULL;--> statement-breakpoint
CREATE INDEX "user_activity_ritual_completed_idx" ON "user_activity_day" USING btree ("user_id","ritual_completed_at");
--> statement-breakpoint
CREATE OR REPLACE FUNCTION vivida_grant_credits_once(
	p_user_id text,
	p_amount integer,
	p_reason text,
	p_ref text,
	p_transaction_id text
)
RETURNS TABLE(was_granted boolean, resulting_balance integer)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
	v_balance integer;
BEGIN
	IF p_amount <= 0 OR p_ref IS NULL OR p_ref = '' THEN
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
			AND ct.reason = p_reason
			AND ct.ref = p_ref
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
	VALUES (p_transaction_id, p_user_id, p_amount, p_reason, p_ref);

	was_granted := true;
	resulting_balance := v_balance;
	RETURN NEXT;
END;
$$;
