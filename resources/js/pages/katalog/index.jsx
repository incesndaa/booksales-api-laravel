import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function About() {
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [cart, setCart] = useState(() => {
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
    const isCustomer = isLoggedIn && user.role === 'customer';

    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(price || 0);
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/books');
                setBooks(response.data);
            } catch (error) {
                console.error('Gagal mengambil data buku:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const genres = [
        ...new Set(
            books
                .map((book) => book.genre?.name)
                .filter(Boolean)
        ),
    ];

    const filteredBooks = books.filter((book) => {
        const keyword = search.toLowerCase();

        const matchSearch = `${book.title} ${book.author?.name || ''}`
            .toLowerCase()
            .includes(keyword);

        const matchGenre =
            selectedGenre === 'all' ||
            book.genre?.name === selectedGenre;

        return matchSearch && matchGenre;
    });

    const handleAddToCart = (book) => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (isAdmin) {
            alert('Admin tidak dapat melakukan pembelian.');
            return;
        }

        if (!book.stock || book.stock < 1) {
            alert('Maaf, stok buku sedang habis.');
            return;
        }

        const existingItem = cart.find((item) => item.id === book.id);

        if (existingItem && existingItem.quantity >= book.stock) {
            alert('Jumlah buku sudah mencapai batas stok.');
            return;
        }

        setCart((prevCart) => {
            const exists = prevCart.find((item) => item.id === book.id);

            if (exists) {
                return prevCart.map((item) =>
                    item.id === book.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [
                ...prevCart,
                {
                    id: book.id,
                    title: book.title,
                    price: book.price,
                    stock: book.stock,
                    cover_photo: book.cover_photo,
                    author: book.author,
                    quantity: 1,
                },
            ];
        });

        setSelectedBook(null);
        alert(`"${book.title}" berhasil ditambahkan ke keranjang!`);
    };

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

    function scrollToSection(id) {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
    return (
        <div className="min-h-screen bg-white text-slate-900">

            {/* Navbar */}
            <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 py-4 md:px-8">

                    {/* Logo kiri */}
                    <Link
                        to="/"
                        className="w-fit text-xl font-bold tracking-tight text-slate-950 no-underline"
                    >
                        Book&Co<span className="text-slate-400">.</span>
                    </Link>

                    {/* Menu tengah */}
                    <div className="flex items-center gap-5 md:gap-8">
                        <Link
                            to="/"
                            className="text-sm font-medium text-slate-700 no-underline transition hover:text-slate-950"
                        >
                            Home
                        </Link>

                        <Link
                            to="/about"
                            className="text-sm font-medium text-slate-950 no-underline"
                        >
                            About
                        </Link>

                        <Link
                            to="/katalog"
                            className="text-sm font-medium text-slate-950 no-underline"
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

                    {/* Aksi kanan */}
                    <div className="flex items-center justify-end gap-5">

                        {/* Keranjang */}
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

                        {/* Profile */}
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

            <section
                id="katalog"
                className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
            >
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">

                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            The collection
                        </p>

                        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                            Explore our books.
                        </h2>

                        <p className="mt-3 text-sm text-slate-500">
                            Pilihan bacaan untuk setiap rasa ingin tahu.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul atau penulis..."
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                            />
                        </div>

                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 sm:w-44"
                        >
                            <option value="all">Semua Genre</option>

                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center text-sm text-slate-500">
                        Memuat koleksi buku...
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="border border-dashed border-slate-200 py-20 text-center">
                        <p className="text-base font-medium text-slate-700">
                            Buku tidak ditemukan
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                            Coba gunakan judul atau nama penulis lain.
                        </p>
                    </div>
                ) : (

                    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredBooks.map((book) => (
                            <article key={book.id} className="group min-w-0">
                                {/* Book Cover */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedBook(book)}
                                    className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-[#f7f7f5] p-4"
                                >
                                    {book.cover_photo ? (
                                        <img
                                            src={book.cover_photo}
                                            alt={book.title}
                                            className="h-full w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-300">
                                            <span className="text-2xl font-semibold tracking-widest">BOOK</span>
                                            <span className="mt-2 text-xs">No cover available</span>
                                        </div>
                                    )}

                                    {Number(book.stock) < 1 && (
                                        <span className="absolute left-3 top-3 rounded bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 shadow-sm">
                                            Stok habis
                                        </span>
                                    )}
                                </button>

                                {/* Book Information */}
                                <div className="pt-4">
                                    <p className="mb-1.5 truncate text-xs text-slate-400">
                                        {book.author?.name || 'Unknown author'}
                                    </p>

                                    <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800">
                                        {book.title}
                                    </h3>

                                    <div className="mt-3 flex flex-col gap-3">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {formatPrice(book.price)}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => handleAddToCart(book)}
                                            disabled={Number(book.stock) < 1 || isAdmin}
                                            className="w-full rounded-md border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                        >
                                            {Number(book.stock) < 1
                                                ? 'Stok Habis'
                                                : isAdmin
                                                    ? 'Khusus Customer'
                                                    : 'Tambah ke Keranjang'}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                )}
            </section>


            {/* Modal Detail Buku */}
            {selectedBook && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedBook(null)}
                >
                    <div
                        className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl md:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedBook(null)}
                            className="absolute right-5 top-4 text-2xl text-slate-400 hover:text-slate-900"
                        >
                            &times;
                        </button>

                        <div className="grid gap-7 md:grid-cols-2">
                            {/* Cover Buku */}
                            <div className="flex items-center justify-center rounded-lg bg-[#f7f7f5] p-6">
                                {selectedBook.cover_photo ? (
                                    <img
                                        src={selectedBook.cover_photo}
                                        alt={selectedBook.title}
                                        className="max-h-72 w-auto object-contain"
                                    />
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        Cover tidak tersedia
                                    </p>
                                )}
                            </div>

                            {/* Informasi Buku */}
                            <div className="flex flex-col justify-center">
                                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                                    {selectedBook.genre?.name || 'Uncategorized'}
                                </p>

                                <h2 className="text-2xl font-semibold text-slate-900">
                                    {selectedBook.title}
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    {selectedBook.author?.name || 'Unknown author'}
                                </p>

                                <p className="mt-5 text-xl font-semibold text-slate-900">
                                    {formatPrice(selectedBook.price)}
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    Stok: {selectedBook.stock}
                                </p>

                                <div className="mt-5 border-t border-slate-100 pt-4">
                                    <p className="mb-2 text-sm font-semibold text-slate-800">
                                        Deskripsi Buku
                                    </p>

                                    <p className="text-sm leading-6 text-slate-500">
                                        {selectedBook.description ||
                                            'Belum ada deskripsi untuk buku ini.'}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(selectedBook)}
                                    disabled={
                                        Number(selectedBook.stock) < 1 || isAdmin
                                    }
                                    className="mt-6 w-full rounded-lg bg-slate-950 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {Number(selectedBook.stock) < 1
                                        ? 'Stok Habis'
                                        : isAdmin
                                            ? 'Khusus Customer'
                                            : 'Tambah ke Keranjang'}
                                </button>
                            </div>e
                        </div>
                    </div>
                </div>
            )}


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
