//// src/controllers/userController.js
//const { users } = require('../models/mockData');
//
///**
// * Retrieves all users from the system
// */
//const getAllUsers = (req, res) => {
//    try {
//        res.json({ success: true, data: users, error: null });
//    } catch (err) {
//        res.status(500).json({
//            success: false,
//            data: null,
//            error: { code: "INTERNAL_SERVER_ERROR", message: err.message }
//        });
//    }
//};
//
///**
// * Retrieves a specific user by their ID
// */
//const getUserById = (req, res) => {
//    const id = parseInt(req.params.id);
//    const user = users.find(u => u.userId === id);
//
//    if (!user) {
//        return res.status(404).json({
//            success: false,
//            data: null,
//            error: { code: "NOT_FOUND", message: "User not found" }
//        });
//    }
//
//    res.json({ success: true, data: user, error: null });
//};
//
///**
// * Admin method to create a new user account
// */
//const createUser = (req, res) => {
//    const { firstName, lastName, userRole, email, password } = req.body;
//
//    if (typeof firstName !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
//        return res.status(400).json({ success: false, error: { message: "Invalid fields" } });
//    }
//
//    if (users.find(u => u.email === email)) {
//        return res.status(400).json({
//            success: false,
//            data: null,
//            error: { code: "DUPLICATE_ERROR", message: "A user with this email already exists." }
//        });
//    }
//
//    const newUser = {
//        userId: users.length ? Math.max(...users.map(u => u.userId)) + 1 : 1,
//        firstName,
//        lastName,
//        userRole: userRole || 'customer',
//        email,
//        password,
//        createDate: new Date(),
//        updateDate: new Date()
//    };
//
//    users.push(newUser);
//    res.status(201).json({ success: true, data: newUser, error: null });
//};
//
///**
// * Public registration endpoint
// */
//const signupUser = (req, res) => {
//    const { firstName, lastName, email, password } = req.body;
//
//    if (!firstName || !lastName || !email || !password) {
//        return res.status(400).json({
//            success: false,
//            data: null,
//            error: { code: "VALIDATION_ERROR", message: "All fields are required." }
//        });
//    }
//
//    if (password.length < 6) {
//        return res.status(400).json({
//            success: false,
//            data: null,
//            error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters." }
//        });
//    }
//
//    if (users.find(u => u.email === email)) {
//        return res.status(409).json({
//            success: false,
//            data: null,
//            error: { code: "DUPLICATE_ERROR", message: "A user with this email already exists." }
//        });
//    }
//
//    const newUser = {
//        userId: users.length ? Math.max(...users.map(u => u.userId)) + 1 : 1,
//        firstName,
//        lastName,
//        email,
//        password,
//        userRole: 'customer',
//        createDate: new Date(),
//        updateDate: new Date()
//    };
//
//    users.push(newUser);
//
//    res.status(201).json({
//        success: true,
//        data: {
//            token: `mock-token-${newUser.userId}`,
//            userId: newUser.userId,
//            userRole: newUser.userRole,
//            firstName: newUser.firstName,
//            lastName: newUser.lastName,
//            email: newUser.email
//        },
//        error: null
//    });
//};
//
///**
// * Removes a user from the system by ID
// */
//const deleteUser = (req, res) => {
//    const id = parseInt(req.params.id);
//    const index = users.findIndex(u => u.userId === id);
//
//    if (index === -1) {
//        return res.status(404).json({
//            success: false,
//            data: null,
//            error: { code: "NOT_FOUND", message: "User not found" }
//        });
//    }
//
//    users.splice(index, 1);
//    res.json({ success: true, data: { userId: id }, error: null });
//};
//
///**
// * Updates existing user details
// */
//const updateUser = (req, res) => {
//    const id = parseInt(req.params.id);
//    const { firstName, lastName, userRole, email, password } = req.body;
//    const userIndex = users.findIndex(u => u.userId === id);
//
//    if (userIndex === -1) {
//        return res.status(404).json({
//            success: false,
//            data: null,
//            error: { code: "NOT_FOUND", message: "User not found" }
//        });
//    }
//
//    users[userIndex] = {
//        ...users[userIndex],
//        firstName: firstName || users[userIndex].firstName,
//        lastName: lastName || users[userIndex].lastName,
//        userRole: userRole || users[userIndex].userRole,
//        email: email || users[userIndex].email,
//        password: password || users[userIndex].password,
//        updateDate: new Date()
//    };
//
//    res.json({ success: true, data: users[userIndex], error: null });
//};
//
///**
// * Authenticates a user and returns a mock token
// */
//const loginUser = (req, res) => {
//    try {
//        const { email, password } = req.body;
//
//        if (!email || !password) {
//            return res.status(400).json({ success: false, error: { message: "Email and password required" } });
//        }
//
//        const user = users.find(u => u.email === email);
//
//        if (!user || user.password !== password) {
//            return res.status(401).json({ success: false, error: { message: "Invalid credentials" } });
//        }
//
//        res.json({
//            success: true,
//            data: {
//                token: `mock-token-${user.userId}`,
//                userId: user.userId,
//                userRole: user.userRole,
//                firstName: user.firstName,
//                lastName: user.lastName,
//                email: user.email
//            }
//        });
//    } catch (err) {
//        res.status(500).json({ success: false, error: { message: "Login failed" } });
//    }
//};
//
//module.exports = {
//    getAllUsers,
//    getUserById,
//    createUser,
//    signupUser,
//    updateUser,
//    deleteUser,
//    loginUser
//};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Order, OrderItem, Product } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password, skinType, concern } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, skinType, concern });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAll = async (_req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

exports.getById = async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
};

// ⭐ JOIN query: כל ההזמנות של המשתמש עם פרטי המוצרים
exports.getUserOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.params.id },
    include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
};

exports.update = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  await user.update(req.body);
  res.json(user);
};

exports.remove = async (req, res) => {
  const n = await User.destroy({ where: { id: req.params.id } });
  res.json({ deleted: n });
};
