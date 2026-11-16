
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch {
            return [];
        }
    });

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(price || 0);
    };

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const updateQuantity = (id, change) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.id !== id) return item;

                    const newQuantity = item.quantity + change;

                    if (newQuantity < 1) return item;

                    if (newQuantity > Number(item.stock)) {
                        alert('Jumlah melebihi stok buku yang tersedia.');
                        return item;
                    }

                    return {
                        ...item,
                        quantity: newQuantity,
                    };
                })
        );
    };

    const removeItem = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    );

    const handleCheckout = () => {
        if (!token || !user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'customer') {
            alert('Hanya customer yang dapat melakukan pembelian.');
            return;
        }

        navigate('/checkout');
    };

    if (!token || !user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Login diperlukan
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    Silakan login terlebih dahulu untuk melihat keranjang.
                </p>
                <Link
                    to="/login"
                    className="mt-6 bg-slate-950 px-6 py-3 text-sm font-medium text-white no-underline transition hover:bg-slate-700"
                >
                    Login
                </Link>
            </div>
        );
    }

    if (user.role !== 'customer') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Akses tidak tersedia
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    Keranjang belanja hanya tersedia untuk customer.
                </p>
                <Link
                    to="/"
                    className="mt-6 bg-slate-950 px-6 py-3 text-sm font-medium text-white no-underline"
                >
                    Kembali ke Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f8f7] text-slate-900">

            {/* Navbar */}
            <nav className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-tight text-slate-950 no-underline"
                    >
                        BookSales<span className="text-slate-400">.</span>
                    </Link>

                    <Link
                        to="/"
                        className="text-sm font-medium text-slate-600 no-underline transition hover:text-slate-950"
                    >
                        ← Lanjut Belanja
                    </Link>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">

                {/* Heading */}
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Your selection
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                        Keranjang Belanja
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        {totalItems} buku dalam keranjangmu.
                    </p>
                </div>

                {cart.length === 0 ? (
                    <div className="border border-slate-200 bg-white px-6 py-20 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                            </svg>
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-slate-900">
                            Keranjang masih kosong
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Temukan buku menarik dan tambahkan ke keranjangmu.
                        </p>

                        <Link
                            to="/"
                            className="mt-7 inline-block bg-slate-950 px-6 py-3 text-sm font-medium text-white no-underline transition hover:bg-slate-700"
                        >
                            Jelajahi Buku
                        </Link>
                    </div>
                ) : (
                    <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">

                        {/* Cart Items */}
                        <section className="border border-slate-200 bg-white">

                            <div className="hidden grid-cols-[1fr_120px_130px] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid">
                                <span>Produk</span>
                                <span className="text-center">Jumlah</span>
                                <span className="text-right">Subtotal</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid gap-5 px-5 py-6 md:grid-cols-[1fr_120px_130px] md:items-center md:gap-4 md:px-6"
                                    >
                                        {/* Product */}
                                        <div className="flex min-w-0 gap-4">
                                            <div className="h-28 w-20 shrink-0 bg-[#f3f3f1]">
                                                {item.cover_photo ? (
                                                    <img
                                                        src={item.cover_photo}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                        No Cover
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-col justify-center">
                                                <p className="text-xs text-slate-400">
                                                    {item.author?.name || 'Unknown author'}
                                                </p>

                                                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                                                    {item.title}
                                                </h3>

                                                <p className="mt-2 text-sm text-slate-600">
                                                    {formatPrice(item.price)}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className="mt-3 w-fit text-xs font-medium text-red-500 transition hover:text-red-700"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="flex items-center justify-between md:justify-center">
                                            <span className="text-xs text-slate-400 md:hidden">
                                                Jumlah
                                            </span>

                                            <div className="flex items-center border border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="h-9 w-9 text-slate-600 transition hover:bg-slate-100"
                                                >
                                                    −
                                                </button>

                                                <span className="w-9 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    disabled={item.quantity >= Number(item.stock)}
                                                    className="h-9 w-9 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="flex items-center justify-between md:justify-end">
                                            <span className="text-xs text-slate-400 md:hidden">
                                                Subtotal
                                            </span>

                                            <p className="text-sm font-semibold text-slate-900">
                                                {formatPrice(Number(item.price) * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-200 px-5 py-4 md:px-6">
                                <Link
                                    to="/"
                                    className="text-sm font-medium text-slate-600 no-underline transition hover:text-slate-950"
                                >
                                    ← Tambah buku lainnya
                                </Link>
                            </div>
                        </section>

                        {/* Summary */}
                        <aside className="border border-slate-200 bg-white p-6">
                            <h2 className="text-lg font-semibold tracking-tight">
                                Ringkasan Pesanan
                            </h2>

                            <div className="mt-6 space-y-4 border-b border-slate-100 pb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Total buku
                                    </span>
                                    <span className="font-medium">
                                        {totalItems} item
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Pengiriman
                                    </span>
                                    <span className="text-slate-400">
                                        Belum dihitung
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-5">
                                <span className="text-sm font-semibold">
                                    Total
                                </span>

                                <span className="text-lg font-bold tracking-tight">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                className="w-full bg-slate-950 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700"
                            >
                                Lanjut ke Checkout
                            </button>

                            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                                Detail pembayaran akan ditampilkan pada
                                halaman checkout.
                            </p>
                        </aside>
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-5 py-7 md:px-8">
                    <p className="text-xs text-slate-400">
                        © 2026 BookSales. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
