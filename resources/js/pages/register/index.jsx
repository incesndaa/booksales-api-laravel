
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak sama.');
            return;
        }

        try {
            setLoading(true);

            const response = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
        } catch (error) {
            const errors = error.response?.data?.errors;

            setError(
                errors
                    ? Object.values(errors).flat().join(' ')
                    : error.response?.data?.message ||
                      'Registrasi gagal. Silakan coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        BookSales
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Buat akun untuk mulai menjelajahi buku.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masukkan nama lengkap"
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Masukkan email"
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            required
                            minLength={8}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Konfirmasi Password
                        </label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Masukkan ulang password"
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                        {loading ? 'Mendaftarkan...' : 'Daftar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Sudah punya akun?{' '}
                    <Link
                        to="/login"
                        className="font-semibold text-slate-900 hover:underline"
                    >
                        Login
                    </Link>
                </p>

                <p className="mt-3 text-center text-sm text-slate-500">
                    <Link to="/" className="hover:text-slate-900">
                        Kembali ke Home
                    </Link>
                </p>
            </div>
        </div>
    );
}
