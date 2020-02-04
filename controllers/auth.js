var express = require("express");
var auth = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var nJwt = require('njwt');

auth.post('/login', async function (req, res) {
	req.checkBody("username", "Vui lòng nhập tài khoản").notEmpty();
	req.checkBody("password", "Vui lòng nhập mật khẩu").notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		return res.json(errors);
	} else {
		var { username, password } = req.body;
		var user = await helpers.auth_helper.verify_user(username, password);
		if (user) {
			var tokenSecret = config.app.secretKey;
			var refreshTokenSecret = config.app.refreshTokenSecret;

			// Payload
			var claims = {
				_id: user._id,
				username: username,
				name: user.name,
				email: user.email,
			};

			const token = await helpers.helper.renderToken(tokenSecret, claims, 1 / 144);
			const refreshToken = await helpers.helper.renderToken(refreshTokenSecret, claims, 1);
			const updateRefreshToken = await bols.My_model.update(req, 'Account', { username: username }, { refresh_token: refreshToken });

			return res.status(200).json({ token, refreshToken });
		} else {
			delete (req.body.password);
			return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu chưa đúng.', data: req.body });
		}
	}
});

auth.post('/logout', async function (req, res) {
	req.checkBody("username", "Vui lòng gửi kèm username").notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		return res.json(errors);
	} else {
		const { token } = req.headers;
		// Clear refresToken
		const updateRefreshToken = await bols.My_model.update(req, 'Account', { username: username }, { refresh_token: '' });

		// Create BlackList AccessToken
		const createBlackList = await bols.My_model.update(req, 'Black_list_token', { accessToken: token });

		return res.status(200).json({ message: 'User logout', data: req.body });
	}
});

auth.post('/re-renderToken', async function (req, res) {
	try {
		const refresh_token = req.body.refreshToken;
		const tokenSecret = config.app.secretKey;
		const refreshTokenSecret = config.app.refreshTokenSecret;
		var verifiedJwt = nJwt.verify(refresh_token, refreshTokenSecret);
		const username = verifiedJwt.body.username;

		const account = await bols.My_model.find('Account', { username: username, refresh_token: refresh_token }, 'username email');
		if (account.length > 0) {
			// Payload
			var claims = {
				_id: account._id,
				username: account.username,
				email: account.email,
			};

			const token = await helpers.helper.renderToken(tokenSecret, claims, 1 / 144);
			const refreshTokenNew = await helpers.helper.renderToken(refreshTokenSecret, claims, 1);
			var updateRefreshToken = await bols.My_model.update(req, 'Account', { username }, { refresh_token: refreshTokenNew }, false);

			return res.status(200).json({ message: 'Re-render token success.', data: { token } });
		} else {
			return res.status(400).json({ message: `Username or refreshToken invalid.` });
		}

	} catch (e) {
		console.log(e);
		return res.status(400).json({ message: 'Invalid refreshToken. You need to login againt.' });
	}
});

module.exports = auth;
