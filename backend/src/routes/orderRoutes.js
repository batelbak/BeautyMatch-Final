const router = require('express').Router();
const c = require('../controllers/orderController');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', c.create);
router.patch('/:id/status', c.updateStatus);
// Warehouse "Mark as delivered" button calls this endpoint:
router.patch('/:id/deliver', c.markDelivered);
router.delete('/:id', c.remove);

module.exports = router;
