'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginForm() {
const router = useRouter();
const [formData, setFormData] = useState({
    email: '',
    password: '',
});
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

try {
const result = await signIn('credentials', {
    redirect: false,
    email: formData.email,
    password: formData.password,
});

    if (result.error) {
        setError('Invalid email or password');
    } else {
        router.push('/dashboard');
        router.refresh();
    }
    } catch (error) {
        console.error('Login error:', error);
        setError('An error occurred. Please try again.');
    } finally {
        setLoading(false);
    }
};

const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your POS account</p>
        </div>

        {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
        </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
            </label>
            <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
        </div>

        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
            </label>
            <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>
        </div>

        <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
            {loading ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
            </span>
            ) : (
            'Sign In'
            )}
        </button>
        </form>

        <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
            {/* Don't have an account?{' '} */}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign up here
            </a>
        </p>
        </div>
    </div>
    </div>
);
}