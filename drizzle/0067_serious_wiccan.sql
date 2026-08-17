/*
    Widen the transit-library primary key from (key) to (key, language).

    drizzle-kit cannot yet infer the existing PK's name, so it emitted the
    DROP as a comment for a human to fill in. The name below was read off the
    live database:

        SELECT conname FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'transit_interpretation_library' AND c.contype = 'p';
        -- transit_interpretation_library_pkey

    Written as ONE `ALTER TABLE` with two actions rather than drizzle's two
    separate statements: this driver is neon-http, which cannot open a
    transaction (see the note on db.transaction in lib), so two statements
    would leave the table with no primary key at all in between. A single
    ALTER is atomic. The new constraint reuses the old name, so the table ends
    up with exactly one PK under the name Postgres would have chosen anyway.
*/

ALTER TABLE "transit_interpretation_library"
	DROP CONSTRAINT "transit_interpretation_library_pkey",
	ADD CONSTRAINT "transit_interpretation_library_pkey" PRIMARY KEY ("key", "language");
