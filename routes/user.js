const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.get('/', async (req, res, next) => {
	if (req.session.user) {
		res.render('user/profile', req.session.user);
	} else {
		res.redirect('/login');
	}
});

module.exports = router;
