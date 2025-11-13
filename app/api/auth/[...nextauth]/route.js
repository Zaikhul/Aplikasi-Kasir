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
        await connectDB();

        const user = await User.findOne({ email: credentials.email });
            if (!user) {
                throw new Error('Invalid email or password');
            }
        const isValid = await user.comparePassword(credentials.password);
            if (!isValid) {
                throw new Error('Invalid email or password');
            }
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            subscription: user.subscription,
        };
    },}),
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