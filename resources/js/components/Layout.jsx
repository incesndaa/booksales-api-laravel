import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const menus = [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Books', path: '/admin/books' },
        { name: 'Genres', path: '/admin/genres' },
        { name: 'Authors', path: '/admin/authors' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Transactions', path: '/admin/transactions' },
        { name: 'Messages', path: '/admin/messages' },
    ];

    const handleLogout = async () => {
        if (!window.confirm('Yakin ingin logout?')) return;

        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f8f7]">
            <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-8">

                {/* Brand */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Book&Co<span className="text-slate-400">.</span>
                    </h1>
                    <p className="mt-1 text-xs text-slate-400">
                        Administration
                    </p>
                </div>

                {/* Navigation */}
                <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Menu
                </p>

                <nav className="flex-1 space-y-1">
                    {menus.map((menu) => {
                        const active = location.pathname === menu.path;

                        return (
                            <Link
                                key={menu.path}
                                to={menu.path}
                                className={`block rounded-lg px-3 py-2.5 text-sm no-underline transition ${
                                    active
                                        ? 'bg-slate-100 font-semibold text-slate-900'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                {menu.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin */}
                <div className="border-t border-slate-100 pt-5">

                    <button
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-slate-50 hover:text-slate-500"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <main className="min-h-screen p-6 md:ml-64 md:p-10">
                <Outlet />
            </main>
        </div>
    );
}
