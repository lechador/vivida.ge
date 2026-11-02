/**
 * Mint Auth.js session cookies for the seeded local audit users, so the
 * signed-in mobile sweep can run against the disposable database only.
 */
import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { encode } from "next-auth/jwt";

loadEnv({ path: path.resolve(import.meta.dirname, "../../../.env.local") });

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("AUTH_SECRET missing");

const users = {
  nino: {
    id: "11111111-1111-4111-8111-111111111111",
    email: "nino.audit@vivida.test",
    name: "ნინო ტესტაძე",
  },
  ana: {
    id: "33333333-3333-4333-8333-333333333333",
    email: "ana.audit@vivida.test",
    name: "ანა კალანდაძე",
  },
  newbie: {
    id: "44444444-4444-4444-8444-444444444444",
    email: "new.audit@vivida.test",
    name: "ახალი მომხმარებელი",
  },
  luka: {
    id: "22222222-2222-4222-8222-222222222222",
    email: "luka.audit@vivida.test",
    name: "ლუკა მეგობრიშვილი",
  },
};

const cookieName = "authjs.session-token";

for (const [key, user] of Object.entries(users)) {
  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      picture: null,
    },
    secret,
    salt: cookieName,
  });
  const cookies = [
    {
      name: cookieName,
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ];
  fs.writeFileSync(
    path.join(import.meta.dirname, `cookies-${key}.json`),
    JSON.stringify(cookies, null, 2),
  );
  console.log("wrote cookies-" + key + ".json");
}
