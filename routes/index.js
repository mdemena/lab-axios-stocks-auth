const express = require('express');
const Stock = require('../models/stock');
const router = express.Router();

router.get('/', async (req, res, next) => {
	if (req.session.user) {
		res.render('index', { user: req.session.user });
	} else {
		res.render('index');
	}
});

module.exports = router;
