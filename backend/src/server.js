require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('../models');
const initSockets = require('./sockets');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || '*' } });
app.set('io', io);
initSockets(io);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.get('/api/health', (_req, res) =>
  res.json({ success: true, data: { ok: true }, error: null })
);

app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`)))
  .catch((err) => console.error('DB error:', err));
