import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    async function fetchTransactions() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/transactions');
            setTransactions(response.data);
        } catch (err) {
            console.error(err);
            setError('Gagal mengambil data transaksi.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    function getStatus(status) {
        const value = String(status || '').toLowerCase();

        if (['paid', 'settlement', 'capture'].includes(value)) {
            return 'paid';
        }

        if (value === 'pending') return 'pending';

        if (['failed', 'deny', 'cancel'].includes(value)) {
            return 'failed';
        }

        if (value === 'expired') return 'expired';

        return value || 'unknown';
    }

    function getStatusStyle(status) {
        const value = getStatus(status);

        const styles = {
            paid: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700',
            expired: 'bg-gray-200 text-gray-600',
        };

        return styles[value] || 'bg-gray-100 text-gray-600';
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(price) || 0);
    }

    function formatDate(date) {
        if (!date) return '-';

        return new Date(date).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    const filteredTransactions = transactions.filter((transaction) => {
        const keyword = search.toLowerCase();

        const matchesSearch =
            transaction.order_number?.toLowerCase().includes(keyword) ||
            transaction.customer?.name?.toLowerCase().includes(keyword) ||
            transaction.customer?.email?.toLowerCase().includes(keyword);

        const matchesStatus =
            statusFilter === 'all' ||
            getStatus(transaction.payment_status) === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalTransactions = transactions.length;

    const paidTransactions = transactions.filter(
        (transaction) => getStatus(transaction.payment_status) === 'paid'
    );

    const totalRevenue = paidTransactions.reduce(
        (total, transaction) => total + Number(transaction.total_amount || 0),
        0
    );

    const pendingTransactions = transactions.filter(
        (transaction) => getStatus(transaction.payment_status) === 'pending'
    ).length;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Transactions
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Kelola dan pantau transaksi pembelian buku.
                </p>
            </div>

            {/* Summary */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Transactions
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {totalTransactions}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Revenue
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        {formatPrice(totalRevenue)}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Pending Transactions
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {pendingTransactions}
                    </h2>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="rounded-xl bg-white p-6 shadow-sm">

                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            All Transactions
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Daftar seluruh transaksi pelanggan.
                        </p>
                    </div>

                    <button
                        onClick={fetchTransactions}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Refresh
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="mb-5 flex flex-col gap-3 md:flex-row">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari order ID atau customer..."
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                    >
                        <option value="all">Semua Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-12 text-center text-slate-500">
                        Loading transactions...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="px-4 py-4 font-medium">Order ID</th>
                                    <th className="px-4 py-4 font-medium">Customer</th>
                                    <th className="px-4 py-4 font-medium">Date</th>
                                    <th className="px-4 py-4 font-medium">Total</th>
                                    <th className="px-4 py-4 font-medium">Status</th>
                                    <th className="px-4 py-4 text-center font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="border-b border-slate-100 transition hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-4 font-medium text-slate-900">
                                                {transaction.order_number}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {transaction.customer?.name || '-'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {transaction.customer?.email || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {formatDate(transaction.created_at)}
                                            </td>

                                            <td className="px-4 py-4 font-medium text-slate-800">
                                                {formatPrice(transaction.total_amount)}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(transaction.payment_status)}`}>
                                                    {getStatus(transaction.payment_status)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedTransaction(transaction)}
                                                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-4 py-12 text-center text-slate-500"
                                        >
                                            Tidak ada transaksi ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTransaction && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setSelectedTransaction(null)}
                >
                    <div
                        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Transaction Detail
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedTransaction.order_number}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="text-2xl text-slate-400 hover:text-slate-900"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="grid gap-4 py-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">Customer</p>
                                <p className="mt-1 font-medium text-slate-900">
                                    {selectedTransaction.customer?.name || '-'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {selectedTransaction.customer?.email || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">Transaction Date</p>
                                <p className="mt-1 font-medium text-slate-900">
                                    {formatDate(selectedTransaction.created_at)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">Payment Status</p>
                                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(selectedTransaction.payment_status)}`}>
                                    {getStatus(selectedTransaction.payment_status)}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">Paid At</p>
                                <p className="mt-1 font-medium text-slate-900">
                                    {formatDate(selectedTransaction.paid_at)}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-5">
                            <h3 className="mb-4 font-semibold text-slate-900">
                                Purchased Books
                            </h3>

                            <div className="space-y-3">
                                {selectedTransaction.items?.length > 0 ? (
                                    selectedTransaction.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {item.book?.title || item.book?.name || 'Buku'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Jumlah: {item.quantity ?? 1}
                                                </p>
                                            </div>

                                            <p className="whitespace-nowrap text-sm font-medium text-slate-800">
                                                {formatPrice(
                                                    item.subtotal ??
                                                    ((item.price ?? 0) * (item.quantity ?? 1))
                                                )}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        Detail buku tidak tersedia.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                            <span className="font-semibold text-slate-700">
                                Total Payment
                            </span>
                            <span className="text-xl font-bold text-slate-900">
                                {formatPrice(selectedTransaction.total_amount)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
