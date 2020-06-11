const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: [true, 'Email will be unique, this is used'],
		match: [/^\S+@\S+\.\S+$/, 'Invalid email adress.'],
	},
	passwordHash: { type: String, required: true },
	amount: { type: Number, required: true },
	stocks: [
		{
			symbol: { type: String, required: true },
			name: { type: String, required: true },
			price: { type: String, required: true },
			units: { type: Number, required: true },
		},
	],
	transactions: [
		{
			date: { type: Date, require: true },
			transactionType: { type: String, required: true, enum: ['buy', 'sell'] },
			symbol: { type: String, required: true },
			price: { type: String, required: true },
			units: { type: Number, required: true },
		},
	],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
