function initSockets(io) {
  io.on('connection', (socket) => {
    console.log('🔌 connected:', socket.id);

    // הצטרפות לפי תפקיד
    socket.on('user:online', ({ userId, role }) => {
      if (role === 'admin' || role === 'logistics') socket.join('staff');
      if (userId) socket.join(`user:${userId}`);
      io.to('staff').emit('user:online', { userId, role });
    });

    socket.on('notification:read', (payload) => {
      io.to('staff').emit('notification:read', payload);
    });

    socket.on('disconnect', () => console.log('❌ disconnect:', socket.id));
  });
}
module.exports = initSockets;
