import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/schemas/User';

export const authOptions = {
providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
        },

    async authorize(credentials) {
        try {
            await connectDB();

            const email = (credentials?.email || '').toLowerCase().trim();
            const password = credentials?.password || '';

            if (!email || !password) {
                // return null to indicate failed auth (NextAuth shows generic error)
                return null;
            }

            const emailRegex = /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) return null;

            const user = await User.findOne({ email });
            if (!user) {
                return null;
            }

            const isValid = await user.comparePassword(password);
            if (!isValid) {
                return null;
            }

            return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                subscription: user.subscription,
            };
        } catch (err) {
            console.error('Authorize error:', err);
            return null;
        }
    },
  }),
],

callbacks: {
    async jwt({ token, user }) {
    if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscription = user.subscription;
    }
    return token;
    },
    async session({ session, token }) {
    if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.subscription = token.subscription;
    }
    return session;
    },
},

pages: {
    signIn: '/login',
},

session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
},
secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };