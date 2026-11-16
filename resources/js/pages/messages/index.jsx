import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/contact-messages');
            setMessages(response.data);
        } catch (error) {
            console.error('Gagal mengambil pesan:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleRead = async (message) => {
        setSelectedMessage(message);

        if (!message.is_read) {
            try {
                await api.patch(`/contact-messages/${message.id}/read`);
                fetchMessages();
            } catch (error) {
                console.error('Gagal menandai pesan:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus pesan ini?')) return;

        try {
            await api.delete(`/contact-messages/${id}`);

            setSelectedMessage(null);
            fetchMessages();
        } catch (error) {
            console.error('Gagal menghapus pesan:', error);
        }
    };

    if (loading) {
        return <p className="text-slate-500">Loading messages...</p>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Messages
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage messages sent by customers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800">
                            Inbox ({messages.length})
                        </h2>
                    </div>

                    {messages.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            No messages yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {messages.map((message) => (
                                <button
                                    key={message.id}
                                    onClick={() => handleRead(message)}
                                    className={`w-full text-left p-5 hover:bg-slate-50 transition ${
                                        selectedMessage?.id === message.id
                                            ? 'bg-slate-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex justify-between gap-3">
                                        <p className={`text-sm ${
                                            message.is_read
                                                ? 'font-medium text-slate-600'
                                                : 'font-bold text-slate-900'
                                        }`}>
                                            {message.name}
                                        </p>

                                        <span className={`text-xs ${
                                            message.is_read
                                                ? 'text-slate-400'
                                                : 'text-amber-700'
                                        }`}>
                                            {message.is_read ? 'Read' : 'New'}
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium text-slate-700 mt-2">
                                        {message.subject}
                                    </p>

                                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                                        {message.message}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-3">
                                        {new Date(message.created_at).toLocaleString('id-ID')}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit">
                    {selectedMessage ? (
                        <>
                            <div className="flex justify-between items-start gap-3 mb-6">
                                <h2 className="font-semibold text-slate-900">
                                    Message Details
                                </h2>

                                <button
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="text-sm text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">From</p>
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedMessage.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Email</p>
                                    <p className="text-sm text-slate-700 break-all">
                                        {selectedMessage.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Subject</p>
                                    <p className="text-sm text-slate-700">
                                        {selectedMessage.subject}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Message</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Date</p>
                                    <p className="text-sm text-slate-700">
                                        {new Date(selectedMessage.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Select a message
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                Message details will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
