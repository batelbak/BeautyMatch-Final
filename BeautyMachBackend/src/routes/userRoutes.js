const router = require('express').Router();
const c = require('../controllers/userController');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/', c.getAll);
router.get('/:id', c.getById);
router.get('/:id/orders', c.getUserOrders); // ⭐ JOIN
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
