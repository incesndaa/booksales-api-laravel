
import api from './api';

export async function checkout(items) {
    try {
        // Buat transaksi melalui Laravel
        const response = await api.post('/checkout', {
            items: items,
        });

        const data = response.data.data;

        // Pastikan Snap JS sudah dimuat
        if (!window.snap) {
            throw new Error('Midtrans Snap belum berhasil dimuat.');
        }

        // Buka popup pembayaran
        window.snap.pay(data.snap_token, {
            onSuccess: function (result) {
                console.log('Pembayaran berhasil:', result);

                alert(
                    'Pembayaran diterima. Status transaksi sedang diverifikasi.'
                );
            },

            onPending: function (result) {
                console.log('Menunggu pembayaran:', result);

                alert('Pembayaran belum selesai. Silakan selesaikan pembayaran.');
            },

            onError: function (result) {
                console.error('Pembayaran gagal:', result);

                alert('Pembayaran gagal. Silakan coba lagi.');
            },

            onClose: function () {
                console.log('Popup pembayaran ditutup.');
            },
        });

        return data;
    } catch (error) {
        console.error('Checkout error:', error);

        alert(
            error.response?.data?.message ||
            error.message ||
            'Terjadi kesalahan saat checkout.'
        );

        throw error;
    }
}
