var express = require("express");
var login = express.Router();

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
			var signingKey = config.app.secretKey;

			// Payload
			var claims = {
				_id: user._id,
				username: username
			};

			var token = await helpers.helper.renderToken(signingKey, claims, 1);

			return res.status(200).json(token);
		} else {
			return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu chưa đúng.' })
		}
	}
});

module.exports = login;
