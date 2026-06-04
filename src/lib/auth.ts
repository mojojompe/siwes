import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        matricNumber: { label: "Matric Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.matricNumber || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        await connectToDatabase();

        const user = await User.findOne({ matricNumber: credentials.matricNumber });
        if (!user) {
          throw new Error("No user found with this matric number");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return { 
          id: user._id.toString(), 
          firstName: user.firstName, 
          lastName: user.lastName, 
          department: user.department,
          matricNumber: user.matricNumber,
          hasReadDisclaimer: user.hasReadDisclaimer
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.department = (user as any).department;
        token.matricNumber = (user as any).matricNumber;
        token.hasReadDisclaimer = (user as any).hasReadDisclaimer;
      }
      
      // Handle session updates (e.g. from disclaimer page)
      if (trigger === "update" && session?.user) {
        token.firstName = session.user.firstName ?? token.firstName;
        token.lastName = session.user.lastName ?? token.lastName;
        token.department = session.user.department ?? token.department;
        token.matricNumber = session.user.matricNumber ?? token.matricNumber;
        if (session.user.hasReadDisclaimer !== undefined) {
          token.hasReadDisclaimer = session.user.hasReadDisclaimer;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).department = token.department;
        (session.user as any).matricNumber = token.matricNumber;
        (session.user as any).hasReadDisclaimer = token.hasReadDisclaimer;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
};
