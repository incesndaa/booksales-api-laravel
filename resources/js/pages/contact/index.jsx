import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Contact() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [cart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch {
            return [];
        }
    });

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    const isLoggedIn = Boolean(token && user);
    const isAdmin = isLoggedIn && user.role === 'admin';

    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setShowProfileMenu(false);
            navigate('/');
        }
    };

    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess('');
        setError('');

        try {
            await api.post('/contact-messages', form);

            setSuccess('Your message has been sent successfully. Thank you for contacting us!');

            setForm({
                name: '',
                email: '',
                subject: '',
                message: '',
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">

            {/* Navbar */}
            <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 py-4 md:px-8">

                    <Link
                        to="/"
                        className="w-fit text-xl font-bold tracking-tight text-slate-950 no-underline"
                    >
                        Book&Co<span className="text-slate-400">.</span>
                    </Link>

                    <div className="flex items-center gap-5 md:gap-8">
                        <Link
                            to="/"
                            className="text-sm font-semibold text-slate-950 no-underline"
                        >
                            Home
                        </Link>

                        <Link
                            to="/about"
                            className="text-sm font-medium text-slate-700 no-underline transition hover:text-slate-950"
                        >
                            About
                        </Link>

                        <Link
                            to="/katalog"
                            className="text-sm font-medium text-slate-700 no-underline transition hover:text-slate-950"
                        >
                            Katalog
                        </Link>

                        {isLoggedIn && (
                            <Link
                                to="/history"
                                className="whitespace-nowrap text-sm font-medium text-slate-700 no-underline transition hover:text-slate-950"
                            >
                                My Transaction
                            </Link>
                        )}

                         <Link
                            to="/contact"
                            className="text-sm font-medium text-slate-700 no-underline transition hover:text-slate-950"
                        >
                            Contact Us
                        </Link>
                    </div>

                    <div className="flex items-center justify-end gap-5">

                        {isLoggedIn && (
                            <Link
                                to="/cart"
                                className="relative flex items-center justify-center text-slate-700 no-underline transition hover:text-slate-950"
                                title="Keranjang"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>

                                {cartCount > 0 && (
                                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] font-semibold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                                    title="Profile"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M5 21a7 7 0 0 1 14 0" />
                                    </svg>
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                                        <div className="border-b border-slate-100 px-3 py-3">
                                            <p className="truncate text-sm font-semibold">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {user.email}
                                            </p>
                                            <p className="mt-1 text-xs capitalize text-slate-400">
                                                {user.role}
                                            </p>
                                        </div>

                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setShowProfileMenu(false)}
                                                className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100"
                                            >
                                                Dashboard Admin
                                            </Link>
                                        )}
                                        

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-slate-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-5 py-16 md:px-8">
                <div className="text-center mb-12">
                    <p className="text-sm font-semibold tracking-widest text-amber-700 uppercase mb-3">
                        Get in Touch
                    </p>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Contact Us
                    </h1>

                    <p className="text-gray-500 max-w-xl mx-auto">
                        Have a question or need help? Send us a message.
                        We'd love to hear from you.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 max-w-2xl mx-auto">
                    {success && (
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                maxLength={255}
                                placeholder="Your name"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-amber-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                maxLength={255}
                                placeholder="your@email.com"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-amber-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                required
                                maxLength={255}
                                placeholder="What is your message about?"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-amber-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                required
                                maxLength={5000}
                                rows={5}
                                placeholder="Write your message here..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-amber-600 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#171b22] text-white">
                <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">

                    <div className="grid gap-12 md:grid-cols-3">

                        {/* Brand */}
                        <div>
                            <Link
                                to="/"
                                className="text-2xl font-bold tracking-tight text-white no-underline"
                            >
                                Book&Co<span className="text-slate-500">.</span>
                            </Link>

                            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
                                A little world inside every book.
                                Temukan bacaan favoritmu dan mulai perjalanan
                                cerita yang baru bersama Book&Co.
                            </p>
                        </div>

                        {/* Navigation */}
                        <div>
                            <h3 className="text-sm font-semibold tracking-wide text-white">
                                Explore
                            </h3>

                            <div className="mt-5 flex flex-col gap-3">
                                <Link to="/" className="text-sm text-slate-400 no-underline transition hover:text-white">
                                    Home
                                </Link>
                                <Link to="/about" className="text-sm text-slate-400 no-underline transition hover:text-white">
                                    About Us
                                </Link>
                                <Link to="/katalog" className="text-sm text-slate-400 no-underline transition hover:text-white">
                                    Book Catalog
                                </Link>
                                {isLoggedIn && (
                                    <Link to="/history" className="text-sm text-slate-400 no-underline transition hover:text-white">
                                        My Transactions
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-sm font-semibold tracking-wide text-white">
                                Get in Touch
                            </h3>

                            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
                                Punya pertanyaan, kendala, atau ingin mengetahui
                                informasi lebih lanjut? Hubungi tim Book&Co.
                            </p>

                            <a
                                href="https://wa.me/628xxxxxxxxxx"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 inline-flex items-center gap-3 border border-slate-600 px-5 py-3 text-sm font-medium text-slate-950 bg-white no-underline transition hover:border-white hover:text-slate-850"
                            >
                                Contact Us
                            </a>
                        </div>

                    </div>

                    <div className="mt-14 border-t border-slate-700 pt-6">
                        <div className="flex flex-col justify-between gap-3 text-xs text-slate-500 md:flex-row">
                            <p>© 2026 Book&Co. All rights reserved.</p>
                            <p>Made for every book lover.</p>
                        </div>
                    </div>

                </div>
            </footer>

        </div>
    );
}
