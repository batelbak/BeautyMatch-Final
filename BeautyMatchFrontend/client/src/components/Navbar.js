import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';
import socket, { connectSocket, disconnectSocket } from '../services/socket';

const Navbar = () => {
    const navigate = useNavigate();
    const { cart, openCart } = useCart();

    const userString = localStorage.getItem('user');
    const rawUser = userString ? JSON.parse(userString) : null;
    const user = rawUser?.user || rawUser;

    const firstName = user?.name || user?.firstName || '';
    const role = user?.role;


    useEffect(() => {
      if (!user) return;
      connectSocket();
      const onStatus = (payload) => {
        alert(`סטטוס הזמנה #${payload.orderId} עודכן ל-${payload.status}`);
      };
      socket.on('order:statusUpdate', onStatus);
      return () => socket.off('order:statusUpdate', onStatus);
    }, [user?.id]);

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

                {firstName && (
                    <span className="nb-user">hello, <strong>{firstName}</strong></span>
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
