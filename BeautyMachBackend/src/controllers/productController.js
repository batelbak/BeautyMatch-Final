//const { getRecommendationsFromAI } = require('../services/aiService');
//const productsData = require('../data/products.json');
//
//// Load products into a mutable array for in-memory operations
//let products = [...productsData];
//
///**
// * Retrieves all available products
// */
//const getAllProducts = (req, res) => {
//    res.json({ success: true, data: products, error: null });
//};
//
///**
// * Retrieves a specific product by its ID
// */
//const getProductById = (req, res) => {
//    const id = parseInt(req.params.id);
//    const product = products.find(p => p.id === id);
//
//    product
//        ? res.json({ success: true, data: product, error: null })
//        : res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Not found" } });
//};
//
///**
// * Creates a new product and adds it to the products list
// */
//const createProduct = (req, res) => {
//    const { name, price, category, image, description } = req.body;
//
//    if (!name || price == null) {
//        return res.status(400).json({
//            success: false,
//            error: { code: "VALIDATION_ERROR", message: "name and price are required" }
//        });
//    }
//
//    const newProduct = {
//        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
//        name,
//        price: Number(price),
//        category: category || '',
//        image: image || '',
//        description: description || ''
//    };
//
//    products.push(newProduct);
//    res.status(201).json({ success: true, data: newProduct, error: null });
//};
//
///**
// * Updates an existing product's details
// */
//const updateProduct = (req, res) => {
//    const id = parseInt(req.params.id);
//    const idx = products.findIndex(p => p.id === id);
//
//    if (idx === -1) {
//        return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
//    }
//
//    products[idx] = { ...products[idx], ...req.body, id };
//    res.json({ success: true, data: products[idx], error: null });
//};
//
///**
// * Deletes a product from the list by its ID
// */
//const deleteProduct = (req, res) => {
//    const id = parseInt(req.params.id);
//    const idx = products.findIndex(p => p.id === id);
//
//    if (idx === -1) {
//        return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
//    }
//
//    products.splice(idx, 1);
//    res.json({ success: true, data: { id, deleted: true }, error: null });
//};
//
///**
// * Generates personalized product recommendations using the AI service
// */
//const getPersonalizedRecommendations = async (req, res) => {
//    try {
//        const userPreferences = req.body;
//        const aiResponse = await getRecommendationsFromAI(userPreferences, products);
//
//        res.json({
//            success: true,
//            data: {
//                recommendedProducts: aiResponse,
//                aiText: "AI Agent analyzed your skin profile and selected the best products for you."
//            }
//        });
//    } catch (err) {
//        console.error("AI Error:", err);
//        // Fallback to default recommendations in case of AI error
//        res.json({ success: true, data: { recommendedProducts: products.slice(0, 3) } });
//    }
//};
//
//// Export controller methods
//module.exports = {
//    getAllProducts,
//    getProductById,
//    createProduct,
//    updateProduct,
//    deleteProduct,
//    getPersonalizedRecommendations
//};
const { Product } = require('../models');

exports.getAll = async (req, res) => {
  const where = {};
  if (req.query.skinType) where.skinType = req.query.skinType;
  if (req.query.concern) where.concern = req.query.concern;
  const products = await Product.findAll({ where });
  res.json(products);
};

exports.getById = async (req, res) => {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
};

exports.create = async (req, res) => {
  const p = await Product.create(req.body);
  res.status(201).json(p);
};

exports.update = async (req, res) => {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  await p.update(req.body);
  res.json(p);
};

exports.remove = async (req, res) => {
  const n = await Product.destroy({ where: { id: req.params.id } });
  res.json({ deleted: n });
};
