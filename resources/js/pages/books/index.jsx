import { useEffect, useState } from 'react';
import api from '../../services/api';

const initialForm = {
    title: '',
    description: '',
    price: '',
    stock: '',
    genre_id: '',
    author_id: '',
};

export default function Books() {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    async function fetchBooks() {
        try {
            setLoading(true);
            const response = await api.get('/books');
            const data = response.data;
            setBooks(Array.isArray(data) ? data : data.data || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Data Books belum tersedia atau endpoint API bermasalah.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchOptions() {
        try {
            const [genreResponse, authorResponse] = await Promise.all([
                api.get('/genres'),
                api.get('/authors'),
            ]);

            setGenres(
                Array.isArray(genreResponse.data)
                    ? genreResponse.data
                    : genreResponse.data.data || []
            );

            setAuthors(
                Array.isArray(authorResponse.data)
                    ? authorResponse.data
                    : authorResponse.data.data || []
            );
        } catch (err) {
            console.error(err);
            setFormError('Gagal mengambil data genre atau author.');
        }
    }

    useEffect(() => {
        fetchBooks();
        fetchOptions();
    }, []);

    const filteredBooks = books.filter((book) =>
        book.title?.toLowerCase().includes(search.toLowerCase())
    );

    function openAddModal() {
        setEditingBook(null);
        setForm(initialForm);
        setSelectedFile(null);
        setPreview('');
        setFormError('');
        setShowModal(true);
    }

    function openEditModal(book) {
        setEditingBook(book);
        setForm({
            title: book.title || '',
            description: book.description || '',
            price: book.price || '',
            stock: book.stock ?? '',
            genre_id: book.genre_id || book.genre?.id || '',
            author_id: book.author_id || book.author?.id || '',
        });
        setSelectedFile(null);
        setPreview(book.cover_photo || '');
        setFormError('');
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingBook(null);
        setForm(initialForm);
        setSelectedFile(null);
        setPreview('');
        setFormError('');
    }

    function handleFileChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setFormError('File harus berupa gambar.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setFormError('Ukuran gambar maksimal 2 MB.');
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setFormError('');
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setFormError('');

        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (selectedFile) {
                formData.append('cover_photo', selectedFile);
            }

            if (editingBook) {
                formData.append('_method', 'PUT');
                await api.post(`/books/${editingBook.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await api.post('/books', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            closeModal();
            fetchBooks();
        } catch (err) {
            console.error(err);

            const errors = err.response?.data?.errors;

            if (errors) {
                setFormError(
                    Object.values(errors).flat().join(' ')
                );
            } else {
                setFormError(
                    err.response?.data?.message || 'Gagal menyimpan data buku.'
                );
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(book) {
        const confirmed = window.confirm(
            `Yakin ingin menghapus buku "${book.title}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/books/${book.id}`);
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message || 'Gagal menghapus buku.'
            );
        }
    }

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(price || 0);

    return (
        <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-500">
                        MASTER DATA
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Manajemen Books
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Kelola koleksi buku Book&Co.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                    + Tambah Book
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Daftar Books
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {books.length} buku terdaftar
                        </p>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul buku..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 sm:w-64"
                    />
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Memuat data buku...
                    </div>
                ) : error ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            onClick={fetchBooks}
                            className="mt-3 text-sm font-medium text-slate-900 underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">No.</th>
                                    <th className="px-6 py-4 font-medium">Cover</th>
                                    <th className="px-6 py-4 font-medium">Judul Buku</th>
                                    <th className="px-6 py-4 font-medium">Author</th>
                                    <th className="px-6 py-4 font-medium">Genre</th>
                                    <th className="px-6 py-4 font-medium">Harga</th>
                                    <th className="px-6 py-4 font-medium">Stok</th>
                                    <th className="px-6 py-4 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredBooks.map((book, index) => (
                                    <tr key={book.id} className="transition hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">
                                            {index + 1}
                                        </td>

                                        <td className="px-6 py-3">
                                            {book.cover_photo ? (
                                                <img
                                                    src={book.cover_photo}
                                                    alt={book.title}
                                                    className="h-16 w-12 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                                                    No image
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {book.title}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {book.author?.name || '-'}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {book.genre?.name || '-'}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {formatPrice(book.price)}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {book.stock}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(book)}
                                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(book)}
                                                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredBooks.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                            Data buku tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-gray-100 px-6 py-4">
                    <p className="text-xs text-gray-400">
                        Menampilkan {filteredBooks.length} dari {books.length} data
                    </p>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingBook ? 'Edit Book' : 'Tambah Book'}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Lengkapi informasi buku di bawah ini.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="text-xl text-gray-400 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            {formError && (
                                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Judul Buku
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                    placeholder="Masukkan judul buku"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                    placeholder="Deskripsi buku"
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Harga
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                        placeholder="Contoh: 85000"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Stok
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                        placeholder="Jumlah stok"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Author
                                    </label>
                                    <select
                                        name="author_id"
                                        value={form.author_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                    >
                                        <option value="">Pilih Author</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Genre
                                    </label>
                                    <select
                                        name="genre_id"
                                        value={form.genre_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                    >
                                        <option value="">Pilih Genre</option>
                                        {genres.map((genre) => (
                                            <option key={genre.id} value={genre.id}>
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Cover Buku
                                </label>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleFileChange}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    Format JPG, JPEG, PNG, atau WEBP. Maksimal 2 MB.
                                </p>

                                {preview && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-xs text-gray-500">
                                            Preview Cover
                                        </p>
                                        <img
                                            src={preview}
                                            alt="Preview cover"
                                            className="h-40 w-28 rounded-lg border border-gray-200 object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
