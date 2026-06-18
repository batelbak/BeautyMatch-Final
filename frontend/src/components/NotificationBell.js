import React, { useEffect, useState } from 'react';
import socket, { connectSocket } from '../services/socket';


const NotificationBell = ({ role }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (role !== 'admin' && role !== 'logistics') return;
    connectSocket();

    const onNewOrder = (order) => {
      setItems((prev) => [
        { id: order.id, text: `הזמנה חדשה #${order.id} מ-${order?.user?.name || 'לקוח'} – ${order.total}₪`, read: false, ts: Date.now() },
        ...prev,
      ].slice(0, 20));
    };

    socket.on('order:new', onNewOrder);
    return () => { socket.off('order:new', onNewOrder); };
  }, [role]);

  if (role !== 'admin' && role !== 'logistics') return null;

  const unread = items.filter((i) => !i.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    socket.emit('notification:read', { count: unread, at: Date.now() });
  };

  return (
    <div style={{ position: 'relative', marginRight: 10 }}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', fontSize: 20 }}
        aria-label="notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -6, background: '#e91e63',
            color: '#fff', borderRadius: '50%', fontSize: 11, padding: '1px 6px'
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '120%', width: 320, maxHeight: 360, overflowY: 'auto',
          background: '#fff', border: '1px solid #eee', boxShadow: '0 6px 24px rgba(0,0,0,.12)',
          borderRadius: 10, padding: 10, zIndex: 1000
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>התראות</div>
          {items.length === 0 && <div style={{ fontSize: 13, color: '#888' }}>אין התראות חדשות</div>}
          {items.map((n) => (
            <div key={n.id + '_' + n.ts} style={{ padding: '8px 6px', borderBottom: '1px solid #f3f3f3', fontSize: 13 }}>
              {n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
