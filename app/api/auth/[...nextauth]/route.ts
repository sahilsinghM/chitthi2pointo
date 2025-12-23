import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";

const handler = NextAuth({
  session: {
    strategy: "jwt"
  },
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // TODO: replace with real user lookup + password verification.
        return {
          id: "demo-user",
          name: "Demo User",
          email: credentials.email
        };
      }
    })
  ]
});

export { handler as GET, handler as POST };
