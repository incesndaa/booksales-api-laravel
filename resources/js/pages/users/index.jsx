
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error(error);
            setError(
                error.response?.data?.message ||
                'Gagal mengambil data user.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('customer');
        setEditingUser(null);
        setError('');
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim()) {
            setError('Nama dan email wajib diisi.');
            return;
        }

        if (!editingUser && !password) {
            setError('Password wajib diisi.');
            return;
        }

        const payload = {
            name: name.trim(),
            email: email.trim(),
            role,
        };

        if (password) {
            payload.password = password;
        }

        try {
            setSaving(true);

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, payload);
            } else {
                await api.post('/users', payload);
            }

            closeModal();
            fetchUsers();
        } catch (error) {
            const errors = error.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join(' ')
                    : error.response?.data?.message ||
                      'Terjadi kesalahan. Silakan coba lagi.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Yakin ingin menghapus user "${user.name}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/users/${user.id}`);
            fetchUsers();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                'Gagal menghapus user.'
            );
        }
    };

    const filteredUsers = users.filter((user) =>
        `${user.name} ${user.email} ${user.role}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Manage User
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Kelola data pengguna Book&Co.
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                >
                    + Tambah User
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Daftar User
                    </h2>

                    <input
                        type="text"
                        placeholder="Cari nama, email, atau role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500 sm:w-72"
                    />
                </div>

                {error && !isModalOpen && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                        Memuat data user...
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="px-4 py-3 font-medium">No</th>
                                    <th className="px-4 py-3 font-medium">Nama</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 text-center font-medium">Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-4 py-4 text-slate-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-4 font-medium text-slate-800">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        user.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-4 py-8 text-center text-slate-500"
                                        >
                                            Tidak ada data user.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    Total {filteredUsers.length} user
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingUser ? 'Edit User' : 'Tambah User'}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Lengkapi informasi pengguna berikut.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Nama
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Masukkan email"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Password {editingUser && '(Kosongkan jika tidak diubah)'}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                                >
                                    <option value="user">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
