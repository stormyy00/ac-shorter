import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { jwt } from "better-auth/plugins";
import { users, accounts, sessions, verification, jwks } from "@/db/schema";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: users,
      account: accounts,
      session: sessions,
      verification: verification,
      jwks: jwks,
    },
  }),
  socialProviders: {
    google: {
      mapProfileToUser: (profile) => ({
        firstName: profile.given_name,
        lastName: profile.family_name,
        email: profile.email,
        image: profile.picture,
        role: {},
      }),
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [jwt()],
  baseURL: process.env.BETTERAUTH_URL || "http://localhost:3000",
});


export const getToken = async () => {
  return await auth.api.getToken({
    headers: await headers(),
  });
};