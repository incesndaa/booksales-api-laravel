
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Genres() {
    const [genres, setGenres] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const response = await api.get('/genres');
            setGenres(response.data);
        } catch (err) {
            setError('Gagal mengambil data genre.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const openAddModal = () => {
        setEditingGenre(null);
        setName('');
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (genre) => {
        setEditingGenre(genre);
        setName(genre.name);
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGenre(null);
        setName('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Nama genre wajib diisi.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            if (editingGenre) {
                await api.put(`/genres/${editingGenre.id}`, {
                    name: name.trim(),
                });
            } else {
                await api.post('/genres', {
                    name: name.trim(),
                });
            }

            closeModal();
            await fetchGenres();
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Akses ditolak. Silakan login sebagai admin terlebih dahulu.');
            } else {
                setError(
                    err.response?.data?.message || 'Gagal menyimpan genre.'
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (genre) => {
        const confirmed = window.confirm(
            `Yakin ingin menghapus genre "${genre.name}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/genres/${genre.id}`);
            await fetchGenres();
        } catch (err) {
            window.alert(
                err.response?.data?.message || 'Gagal menghapus genre.'
            );
        }
    };

    const filteredGenres = genres.filter((genre) =>
        genre.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-sm font-medium tracking-wide text-slate-500">
                        MASTER DATA
                    </p>
                    <h1 className="text-3xl font-semibold text-slate-800">
                        Manajemen Genre
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Kelola kategori genre buku Book&Co.
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="rounded-lg bg-slate-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    + Tambah Genre
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Daftar Genre
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {genres.length} genre terdaftar
                        </p>
                    </div>

                    <input
                        type="text"
                        placeholder="Cari genre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500 sm:w-72"
                    />
                </div>

                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                        Memuat data...
                    </p>
                ) : error && genres.length === 0 ? (
                    <p className="py-10 text-center text-sm text-red-500">
                        {error}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">No.</th>
                                    <th className="px-6 py-4 font-medium">Nama Genre</th>
                                    <th className="px-6 py-4 font-medium">ID</th>
                                    <th className="px-6 py-4 text-center font-medium">Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredGenres.length > 0 ? (
                                    filteredGenres.map((genre, index) => (
                                        <tr
                                            key={genre.id}
                                            className="border-t border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4 text-slate-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {genre.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                #{genre.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() => openEditModal(genre)}
                                                        className="font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(genre)}
                                                        className="font-medium text-red-500 hover:text-red-700"
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
                                            colSpan="4"
                                            className="px-6 py-10 text-center text-slate-500"
                                        >
                                            Data genre tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-400">
                    Menampilkan {filteredGenres.length} dari {genres.length} data
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {editingGenre ? 'Edit Genre' : 'Tambah Genre'}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Isi nama genre buku.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Nama Genre
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Masukkan nama genre"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                            />

                            {error && (
                                <p className="mt-3 text-sm text-red-500">
                                    {error}
                                </p>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
