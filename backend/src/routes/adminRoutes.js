const router = require('express').Router();
const c = require('../controllers/adminController');

router.post('/login', c.login);
router.post('/', c.create);
router.get('/', c.getAll);
router.delete('/:id', c.remove);

module.exports = router;
