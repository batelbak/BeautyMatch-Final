import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';
import socket, { connectSocket, disconnectSocket } from '../services/socket';
const readUser = () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    try {
        const raw = JSON.parse(userString);
        return raw?.user || raw;
    } catch {
        return null;
    }
};
const displayName = (user) => {
    if (!user) return '';
    const fn = user.firstName || '';
    const ln = user.lastName || '';
    const combined = `${fn} ${ln}`.trim();
    return combined || user.name || '';
};
const Navbar = () => {
    const navigate = useNavigate();
    const { cart, openCart } = useCart();
    // Re-render whenever localStorage user changes (settings save, login, logout).
    const [user, setUser] = useState(readUser);
    useEffect(() => {
        const refresh = () => setUser(readUser());
        window.addEventListener('user-changed', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('user-changed', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, []);
    const name = displayName(user);
    const role = user?.role;
      useEffect(() => {
          if (!user?.id) return;
          connectSocket();
          const onStatus = (payload) => {
              alert(`סטטוס הזמנה #${payload.orderId} עודכן ל-${payload.status}`);
          };
          socket.on('order:statusUpdate', onStatus);
          return () => socket.off('order:statusUpdate', onStatus);
      }, [user]);

    const handleLogout = () => {
        disconnectSocket();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('user-changed'));
        navigate('/login');
    };
    const cartCount = cart.length;
    return (
        <nav className="nb">
            <div className="nb-center">
                <Link to="/dashboard" className="nb-link">shop</Link>
                <Link to="/quiz" className="nb-link">skin quiz</Link>
                <Link to="/settings" className="nb-link">settings</Link>
            </div>
            <Link to="/dashboard" className="nb-brand-wrap">
                <div className="nb-brand">AI BEAUTY</div>
                <span className="nb-brand-sub">by Batel & Sapir</span>
            </Link>
            <div className="nb-right">
                <NotificationBell role={role} />
                {name && (
                    <span className="nb-user">hello, <strong>{name}</strong></span>
                )}
                <button onClick={openCart} className="nb-bag" aria-label="bag"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 7h12l-1 13H7L6 7z" />
                        <path d="M9 7a3 3 0 0 1 6 0" />
                    </svg>
                    {cartCount > 0 && <span className="nb-bag-count">{cartCount}</span>}
                </button>
                {user && <button onClick={handleLogout} className="nb-logout">logout</button>}
            </div>
        </nav>
    );
};
export default Navbar;
