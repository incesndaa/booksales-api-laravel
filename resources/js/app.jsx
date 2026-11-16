import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    HashRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
} from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/home';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Genres from './pages/genres';
import Authors from './pages/authors';
import Books from './pages/books';
import Users from './pages/users';
import Register from './pages/register';
import Cart from './pages/cart';
import Checkout from './pages/checkout';
import History from './pages/history';
import About from './pages/about';
import Transactions from './pages/transaction';
import Katalog from './pages/katalog';
import Contact from './pages/contact';
import Messages from './pages/messages';


function App() {
    return (
        <HashRouter>
            <Routes>
                {/* Halaman User */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Login Regist */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/cart" element={<Cart />} />

                <Route path="/checkout" element={<Checkout />} />
                <Route element={<AuthenticatedRoute />}>
                    <Route path="/history" element={<History />} />
                </Route>
                <Route path="/katalog" element={<Katalog />} />

                {/* Halaman Admin */}
                <Route element={<ProtectedRoute />}>
                
                    <Route element={<Layout />}>
                        <Route path="/admin" element={<Dashboard />} />
                        <Route path="/admin/books" element={<Books />} />
                        <Route path="/admin/genres" element={<Genres />} />
                        <Route path="/admin/authors" element={<Authors />} />
                        <Route path="/admin/users" element={<Users />} />
                        <Route path="/admin/transactions" element={<Transactions />} />
                        <Route path="/admin/messages" element={<Messages />} />
                    </Route>
                </Route>
            </Routes>
        </HashRouter>
    );
}

function ProtectedRoute() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

function AuthenticatedRoute() {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

createRoot(document.getElementById('app')).render(<App />);
