import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // Attach custom data to the JWT
    async jwt({ token, account, user }) {
      if (account && user) {
        token.id = user.id; // Add user ID to the token
        token.email = user.email; // Add email if needed
      }
      return token;
    },

    // Pass custom token data to the session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id; // Attach the ID to the session
        session.user.email = token.email; // Attach the email if needed
      }
      return session;
    },

    // Validate email domain during sign-in
    async signIn({ user }) {
      if (user.email && !user.email.endsWith("@appinessworld.com")) {
        return false; // Reject sign-in if email domain doesn't match
      }
      return true; // Accept sign-in
    },

    // Redirect after sign-in
    async redirect({ url, baseUrl }) {
      return baseUrl + "/dashboard"; // Redirect to dashboard
    },
  },
});
