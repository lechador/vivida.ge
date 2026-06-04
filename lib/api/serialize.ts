/**
 * Shapes DB rows into the JSON the mobile client consumes. Keeping this
 * in one place means the Flutter-facing contract changes deliberately,
 * not as a side effect of a query edit.
 */
export type PublicUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export function toPublicUser(user: {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}
