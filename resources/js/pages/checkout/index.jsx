import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentMessage, setPaymentMessage] = useState('');
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        try {
            const savedCart = JSON.parse(
                localStorage.getItem('cart') || '[]'
            );

            setCart(Array.isArray(savedCart) ? savedCart : []);
        } catch {
            setCart([]);
        }
    }, []);

    const totalItems = cart.reduce(
        (total, item) => total + Number(item.quantity),
        0
    );

    const totalPrice = cart.reduce(
        (total, item) =>
            total + Number(item.price) * Number(item.quantity),
        0
    );

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(price || 0);

    const formatDate = (date) => {
        if (!date) return '-';

        return new Date(date).toLocaleString('id-ID', {
            dateStyle: 'long',
            timeStyle: 'short',
        });
    };

    // Mengecek status pembayaran dari database
    async function verifyPayment(orderNumber) {
        setCheckingPayment(true);
        setPaymentMessage(
            'Pembayaran berhasil diterima Midtrans. Sedang memverifikasi transaksi...'
        );

        try {
            // Cek maksimal 30 kali, jeda 2 detik
            for (let i = 0; i < 30; i++) {
                const response = await api.get(
                    `/payment-status/${orderNumber}`
                );

                const transaction = response.data;

                if (transaction.payment_status === 'paid') {
                    setReceipt(transaction);

                    localStorage.removeItem('cart');
                    setCart([]);

                    setPaymentMessage('');
                    setCheckingPayment(false);
                    return;
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, 2000)
                );
            }

            setPaymentMessage(
                'Pembayaran sudah diterima Midtrans, tetapi verifikasi server belum selesai. Silakan periksa kembali status pesanan.'
            );
        } catch (err) {
            console.error('Gagal mengecek status pembayaran:', err);

            setError(
                'Gagal mengambil status pembayaran. Silakan refresh halaman dan periksa kembali pesanan.'
            );
        } finally {
            setCheckingPayment(false);
        }
    }

    async function handlePayment() {
        if (cart.length === 0) {
            setError('Keranjang masih kosong.');
            return;
        }

        if (!window.snap) {
            setError('Midtrans belum berhasil dimuat. Refresh halaman.');
            return;
        }

        setLoading(true);
        setError('');
        setPaymentMessage('');

        try {
            const response = await api.post('/checkout', {
                items: cart.map((item) => ({
                    book_id: item.id,
                    quantity: Number(item.quantity),
                })),
            });

            const data = response.data.data;

            window.snap.pay(data.snap_token, {
                onSuccess: function () {
                    verifyPayment(data.order_number);
                },

                onPending: function () {
                    setPaymentMessage(
                        `Pesanan ${data.order_number} masih menunggu pembayaran.`
                    );
                },

                onError: function () {
                    setError(
                        'Pembayaran mengalami kendala. Silakan coba kembali.'
                    );
                },

                onClose: function () {
                    setPaymentMessage(
                        'Jendela pembayaran ditutup. Jika pembayaran sudah dilakukan, status pesanan dapat diperiksa kembali.'
                    );
                },
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                'Checkout gagal dibuat. Silakan coba kembali.'
            );
        } finally {
            setLoading(false);
        }
    }

    // Tampilan struk setelah pembayaran terverifikasi
    if (receipt) {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-12">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-xl border border-gray-200 bg-white p-8">
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                                ✓
                            </div>

                            <h1 className="mt-5 text-2xl font-semibold text-slate-900">
                                Pembayaran Berhasil!
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Terima kasih telah berbelanja di Book&Co<span className="text-slate-400">.</span>
                            </p>
                        </div>

                        <div className="my-8 border-t border-dashed border-gray-300" />

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Nomor Pesanan
                                </span>
                                <span className="text-right font-medium text-slate-900">
                                    {receipt.order_number}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Nama Customer
                                </span>
                                <span className="font-medium text-slate-900">
                                    {receipt.customer?.name || '-'}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Tanggal Pembayaran
                                </span>
                                <span className="text-right font-medium text-slate-900">
                                    {formatDate(receipt.paid_at)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Status
                                </span>
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                    LUNAS
                                </span>
                            </div>
                        </div>

                        <div className="my-8 border-t border-dashed border-gray-300" />

                        <h2 className="mb-4 font-semibold text-slate-900">
                            Detail Pesanan
                        </h2>

                        <div className="space-y-4">
                            {receipt.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between gap-4 text-sm"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {item.book?.title || 'Buku'}
                                        </p>
                                        <p className="mt-1 text-gray-500">
                                            {item.quantity} x {formatPrice(item.price)}
                                        </p>
                                    </div>

                                    <p className="font-medium text-slate-900">
                                        {formatPrice(
                                            Number(item.quantity) *
                                            Number(item.price)
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="my-6 border-t border-gray-200" />

                        <div className="flex justify-between text-base font-semibold text-slate-900">
                            <span>Total Pembayaran</span>
                            <span>{formatPrice(receipt.total_amount)}</span>
                        </div>

                        <p className="mt-8 text-center text-xs text-gray-400">
                            Simpan bukti pembayaran ini sebagai referensi transaksi.
                        </p>

                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                            Kembali ke Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-white px-6 py-24 text-center">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Keranjang Kosong
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Belum ada buku yang bisa di-checkout.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
                >
                    Kembali ke Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <button
                    onClick={() => navigate('/cart')}
                    className="mb-8 text-sm text-gray-500 hover:text-slate-900"
                >
                    &larr; Kembali ke Keranjang
                </button>

                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        BOOK SALES
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                        Checkout
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Periksa pesanan sebelum melanjutkan pembayaran.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <h2 className="mb-5 font-semibold text-slate-900">
                                Ringkasan Pesanan
                            </h2>

                            <div className="divide-y divide-gray-100">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        {item.cover_photo ? (
                                            <img
                                                src={item.cover_photo}
                                                alt={item.title}
                                                className="h-24 w-16 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                                No image
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col justify-center">
                                            <h3 className="font-medium text-slate-900">
                                                {item.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {item.author?.name || 'Unknown Author'}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                {item.quantity} x {formatPrice(item.price)}
                                            </p>
                                        </div>

                                        <div className="self-center text-sm font-semibold text-slate-900">
                                            {formatPrice(
                                                Number(item.price) *
                                                Number(item.quantity)
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <h2 className="font-semibold text-slate-900">
                                Detail Pembayaran
                            </h2>

                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Total buku</span>
                                    <span>{totalItems} item</span>
                                </div>

                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between font-semibold text-slate-900">
                                        <span>Total</span>
                                        <span>{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {paymentMessage && (
                                <div className="mt-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                                    {paymentMessage}
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={
                                    loading ||
                                    checkingPayment ||
                                    Boolean(paymentMessage)
                                }
                                className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? 'Memproses...'
                                    : checkingPayment
                                        ? 'Memverifikasi Pembayaran...'
                                        : 'Bayar Sekarang'}
                            </button>

                            <p className="mt-4 text-center text-xs text-gray-400">
                                Pembayaran diproses melalui Midtrans Sandbox.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
