import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      authorization: {
        params: {
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
        token.id = user.id;
        token.email = user.email; 
      }
      return token;
    },

    // Pass custom token data to the session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id; 
        session.user.email = token.email; 
      }
      return session;
    },

    // Validate email domain during sign-in
    async signIn({ user }) {
      if (user.email && !user.email.endsWith("@appinessworld.com")) {
        return false; 
      }
      return true; 
    },

    // Redirect after sign-in
    async redirect({ url, baseUrl }) {
      return baseUrl + "/dashboard"; 
    },
  },
});
