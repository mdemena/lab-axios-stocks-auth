const express = require('express');
const axios = require('axios');
const User = require('../models/user');
const router = express.Router();

router.get('/', async (req, res, next) => {
	if (req.session.user) {
		res.render('stocks/new');
	} else {
		res.redirect('/login');
	}
});
router.get('/:symbolId', (req, res, next) => {
	if (req.session.user) {
		let selSymbol = req.session.user.stocks.filter(
			(stock) => stock.symbol === req.params.symbolId
		);
		res.render('stocks/show', { showSymbol: selSymbol[0] });
	} else {
		res.redirect('/login');
	}
});
router.post('/:symbolId', async (req, res, next) => {
	if (req.session.user) {
		let sellSymbol = req.session.user.stocks.filter(
			(stock) => stock.symbol === req.params.symbolId
		);
		if (sellSymbol.length > 0) {
			let date = new Date();
			let price = await getSymbolPrice(sellSymbol[0].symbol);
			req.session.amount += sellSymbol[0].units * price;
			req.session.user.stocks = req.session.user.stocks.filter(
				(stock) => stock.symbol != req.params.symbolId
			);
			req.session.user.transactions.push({
				date,
				transactionType: 'sell',
				symbol: sellSymbol[0].symbol,
				price,
				units: sellSymbol[0].units,
			});
			await User.findOneAndUpdate(
				{ email: req.session.user.email },
				req.session.user
			);
			res.redirect('/user');
		}
	} else {
		res.redirect('/login');
	}
});
router.post('/', async (req, res, next) => {
	const { symbol, name, amount } = req.body;
	if (req.session.user) {
		let date = new Date();
		let price = await getSymbolPrice(symbol);
		let units = Math.floor(amount / price);
		req.session.user.amount -= units * price;
		req.session.user.stocks.push({ symbol, name, price, units });
		req.session.user.transactions.push({
			date,
			transactionType: 'buy',
			symbol,
			price,
			units,
		});
		await User.findOneAndUpdate(
			{ email: req.session.user.email },
			req.session.user
		);
		res.redirect('/user');
	} else {
		res.redirect('/login');
	}
});

async function getSymbolPrice(symbol) {
	const key = 'UBKY9YCP2IW6L5D2';
	const functionName = 'GLOBAL_QUOTE';
	const apiUrl = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${key}`;

	try {
		const responseFromAPI = await axios.get(apiUrl);
		return responseFromAPI.data['Global Quote']['05. price'];
	} catch (err) {
		console.log('Error while getting the data: ', err);
		return 1;
	}
}

module.exports = router;
