import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Home() {
    const navigate = useNavigate();

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

            {/* Hero */}
            <section className="bg-[#f5f5f3]">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">

                    <div>
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            A place for every reader
                        </p>

                        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
                            Every book has a story. Find yours.
                        </h1>

                        <p className="mt-6 max-w-md text-sm leading-7 text-slate-600 md:text-base">
                            Temukan berbagai pilihan buku untuk menemani
                            perjalanan, memperluas wawasan, dan membuka
                            perspektif baru.
                        </p>

                        <Link
                            to="/katalog"
                            className="mt-8 inline-flex items-center gap-3 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-medium text-white no-underline transition hover:bg-slate-700"
                        >
                            Jelajahi Koleksi
                            <span>→</span>
                        </Link>
                    </div>

                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200"
                            alt="Rak buku di perpustakaan"
                            className="h-72 w-full object-cover md:h-[380px]"
                        />
                    </div>
                </div>
            </section>

            {/* Reading Categories */}
            <section className="bg-[#f8f8f7]">
                <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">

                    <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Find your next read
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                What are you in the mood for?
                            </h2>

                            <p className="mt-3 text-sm text-slate-500">
                                Pilih suasana membaca yang ingin kamu nikmati.
                            </p>
                        </div>

                        <Link
                            to="/katalog"
                            className="w-fit text-sm font-semibold text-slate-800 no-underline transition hover:text-slate-500"
                        >
                            Lihat semua buku →
                        </Link>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">

                        <Link
                            to="/katalog"
                            className="group flex min-h-64 flex-col justify-between bg-white p-7 no-underline transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    01 / Stories
                                </span>

                                <h3 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">
                                    Escape into stories.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Nikmati cerita dan pengalaman dari berbagai dunia.
                                </p>
                            </div>

                            <span className="mt-8 text-sm font-semibold text-slate-800 transition group-hover:translate-x-1">
                                Explore books →
                            </span>
                        </Link>

                        <Link
                            to="/katalog"
                            className="group flex min-h-64 flex-col justify-between bg-white p-7 no-underline transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    02 / Knowledge
                                </span>

                                <h3 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">
                                    Learn something new.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Perluas wawasan dan temukan pengetahuan baru.
                                </p>
                            </div>

                            <span className="mt-8 text-sm font-semibold text-slate-800 transition group-hover:translate-x-1">
                                Explore books →
                            </span>
                        </Link>

                        <Link
                            to="/katalog"
                            className="group flex min-h-64 flex-col justify-between bg-white p-7 no-underline transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    03 / Inspiration
                                </span>

                                <h3 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">
                                    Find new perspectives.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Temukan ide dan sudut pandang yang berbeda.
                                </p>
                            </div>

                            <span className="mt-8 text-sm font-semibold text-slate-800 transition group-hover:translate-x-1">
                                Explore books →
                            </span>
                        </Link>

                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
                <div className="bg-slate-950 px-7 py-14 text-center md:px-16 md:py-20">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        Your next chapter starts here
                    </p>

                    <h2 className="mx-auto mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                        There's always another story waiting for you.
                    </h2>

                    <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400">
                        Temukan buku berikutnya yang ingin kamu baca.
                    </p>

                    <Link
                        to="/katalog"
                        className="mt-8 inline-flex items-center gap-3 bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 no-underline transition hover:bg-slate-200"
                    >
                        Browse the collection
                        <span>→</span>
                    </Link>
                </div>
            </section>

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
