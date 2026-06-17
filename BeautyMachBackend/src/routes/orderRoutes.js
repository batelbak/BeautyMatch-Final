const router = require('express').Router();
const c = require('../controllers/orderController');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', c.create);
router.patch('/:id/status', c.updateStatus);
router.delete('/:id', c.remove);

module.exports = router;
