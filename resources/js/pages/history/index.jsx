
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        try {
            setLoading(true);
            const response = await api.get('/transactions/history');
            setTransactions(response.data);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                'Gagal mengambil riwayat transaksi.'
            );
        } finally {
            setLoading(false);
        }
    }

    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    function statusLabel(status) {
        const statuses = {
            pending: 'Menunggu Pembayaran',
            paid: 'Berhasil',
            failed: 'Gagal',
        };

        return statuses[status] || status;
    }

    function statusStyle(status) {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            paid: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
        };

        return styles[status] || 'bg-gray-100 text-gray-700';
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <Link
                        to="/"
                        className="text-sm text-gray-500 hover:text-gray-900"
                    >
                        ← Kembali ke Home
                    </Link>

                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Riwayat Transaksi
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Daftar transaksi dan pembelian buku kamu.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-gray-500">
                        Memuat riwayat transaksi...
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
                        {error}
                        <button
                            onClick={fetchHistory}
                            className="ml-3 font-semibold underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Belum Ada Transaksi
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Kamu belum melakukan pembelian buku.
                        </p>
                        <Link
                            to="/"
                            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Nomor Pesanan
                                        </p>
                                        <p className="mt-1 font-semibold text-gray-800">
                                            {transaction.order_number}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {formatDate(transaction.created_at)}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(transaction.payment_status)}`}
                                    >
                                        {statusLabel(transaction.payment_status)}
                                    </span>
                                </div>

                                <div className="space-y-3 py-4">
                                    {transaction.items?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {item.book?.title || 'Buku'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} buku
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-sm text-gray-500">
                                        Total Pembayaran
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {formatRupiah(transaction.total_amount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
