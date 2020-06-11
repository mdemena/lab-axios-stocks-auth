const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const router = express.Router();

const saltRounds = 10;

router.get('/logout', async (req, res, next) => {
	req.session.destroy();
	res.redirect('/');
});
router.get('/login', async (req, res, next) => {
	res.render('auth/login');
});
router.post('/login', async (req, res, next) => {
	const { email, password } = req.body;
	try {
		if (validateData({ email, password }, 'auth/login')) {
			res.render('auth/login', {
				errorMessage: 'Please enter both, email and password to login',
			});
			return;
		}
		const userLogin = await User.findOne({ email: email });
		if (!userLogin) {
			res.render('auth/login', {
				errorMessage: 'Email is not registered. Try and other email.',
			});
			return;
		} else if (bcrypt.compare(password, userLogin.passwordHash)) {
			req.session.user = userLogin;
			res.redirect('/');
			return;
		} else {
			res.render('auth/login', {
				errorMessage: 'Password incorrect. Try again.',
			});
			return;
		}
	} catch (error) {
		next(error);
	}
});
router.get('/signup', async (req, res, next) => {
	res.render('auth/signup');
});
router.post('/signup', async (req, res, next) => {
	const { email, password } = req.body;
	try {
		validateData({ email, password }, 'auth/signup');
		const passwordHash = await bcrypt.hashSync(password, saltRounds);
		const newUser = await User.create({
			email: email,
			passwordHash: passwordHash,
			amount: 10000,
			stocks: [],
			transactions: [],
		});
		console.log('User created succesfully', newUser);
		res.redirect('/login');
	} catch (error) {
		if (error instanceof mongoose.Error.ValidationError) {
			res.status(500).render('auth/signup', {
				errorMessage: error.message,
			});
		} else if (error.code === 11000) {
			res.status(500).render('auth/signup', {
				email: email,
				password: password,
				errorMessage: 'username or email exist...',
			});
		} else {
			next(error);
		}
	}
});
function validateData(data, urlRender) {
	if (!data.email || !data.password) {
		res.render(urlRender, {
			email: data.email,
			password: data.password,
			errorMessage: 'Email and password are mandatory',
		});
		return false;
	}
	const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
	if (!regex.test(data.password)) {
		res.status(500).render(urlRender, {
			email: data.email,
			password: data.password,
			errorMessage:
				'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.',
		});
		return;
	}
}

module.exports = router;
