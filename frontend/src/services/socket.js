import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(URL, { autoConnect: false });

export function connectSocket() {
  if (socket.connected) return socket;
  socket.connect();

  socket.on('connect', () => {
    try {
      const raw = JSON.parse(localStorage.getItem('user'));
      const user = raw?.user || raw;
      if (user) {
        socket.emit('user:online', { userId: user.id, role: user.role });
      }
    } catch (e) { /* ignore */ }
  });

  return socket;
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

export default socket;
