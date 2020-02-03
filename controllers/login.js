var express = require("express");
var login = express.Router();
var db = require('./../models');
var bols = require('./../model_bols');

login.post("/", async function (req, res) {
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
				email: user.email,
			};

			const token = await helpers.helper.renderToken(tokenSecret, claims, 1/144);
			const refreshToken = await helpers.helper.renderToken(refreshTokenSecret, claims, 1);
			await bols.My_model.update(req, 'Account', {username: username}, {refresh_token: refreshToken});

			return res.status(200).json({token , refreshToken});
		} else {
			delete (req.body.password);
			return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu chưa đúng.', data: req.body });
		}
	}
});

module.exports = login;
