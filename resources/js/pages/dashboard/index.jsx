
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [bookResponse, transactionResponse] = await Promise.all([
                    api.get('/books'),
                    api.get('/transactions'),
                ]);

                const getData = (response) => {
                    const data = response.data;
                    return Array.isArray(data) ? data : data.data || [];
                };

                setBooks(getData(bookResponse));
                setTransactions(getData(transactionResponse));

            } catch (error) {
                console.error('Gagal mengambil data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-10">
                <p className="mb-2 text-sm font-medium text-gray-500">
                    OVERVIEW
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Dashboard
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Ringkasan data dan aktivitas Books&Co.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Total Books */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <p className="text-sm font-medium text-gray-500">
                        Total Books
                    </p>

                    <h2 className="mt-4 text-3xl font-semibold text-slate-900">
                        {loading ? '...' : books.length}
                    </h2>

                    <p className="mt-2 text-xs text-gray-400">
                        Buku yang terdaftar
                    </p>
                </div>

                {/* Total Transactions */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <p className="text-sm font-medium text-gray-500">
                        Total Transactions
                    </p>

                    <h2 className="mt-4 text-3xl font-semibold text-slate-900">
                        {loading ? '...' : transactions.length}
                    </h2>

                    <p className="mt-2 text-xs text-gray-400">
                        Transaksi yang tercatat
                    </p>
                </div>

            </div>

            {/* Recent Data */}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">

                {/* Recent Books */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <h3 className="font-semibold text-slate-900">
                            Recent Books
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {books.slice(0, 5).map((book) => (
                            <div key={book.id} className="px-6 py-4">
                                <p className="text-sm font-medium text-slate-700">
                                    {book.title}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {book.author?.name || 'Unknown Author'}
                                </p>
                            </div>
                        ))}

                        {!loading && books.length === 0 && (
                            <p className="px-6 py-5 text-sm text-gray-400">
                                Belum ada data buku.
                            </p>
                        )}

                        {loading && (
                            <p className="px-6 py-5 text-sm text-gray-400">
                                Memuat data...
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <h3 className="font-semibold text-slate-900">
                            Recent Transactions
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {transactions.slice(0, 5).map((transaction) => (
                            <div key={transaction.id} className="px-6 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-slate-700">
                                        {transaction.order_number}
                                    </p>

                                    <span className="text-xs text-gray-500">
                                        {transaction.payment_status}
                                    </span>
                                </div>

                                <p className="mt-1 text-xs text-gray-400">
                                    {transaction.customer?.name || 'Unknown Customer'}
                                </p>
                            </div>
                        ))}

                        {!loading && transactions.length === 0 && (
                            <p className="px-6 py-5 text-sm text-gray-400">
                                Belum ada transaksi.
                            </p>
                        )}

                        {loading && (
                            <p className="px-6 py-5 text-sm text-gray-400">
                                Memuat data...
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
