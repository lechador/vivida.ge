UPDATE "article"
SET
	"image_url" = 'https://pub-7559ca5914024ba3a9e93e5f87debf06.r2.dev/articles/'
		|| substring("image_url" FROM '/images/articles/([^/]+)$'),
	"updated_at" = CURRENT_TIMESTAMP
WHERE "image_url" ~ '^/images/articles/[^/]+$';
