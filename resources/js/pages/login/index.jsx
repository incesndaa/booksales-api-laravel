import { useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', form);

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Login gagal. Periksa koneksi.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        BookSales
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            placeholder="Masukkan email"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            placeholder="Masukkan password"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Login'}
                    </button>
                    <p className="mt-6 text-center text-sm text-slate-500">
                        Belum punya akun?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-slate-900 hover:underline"
                        >
                            Daftar sekarang
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
