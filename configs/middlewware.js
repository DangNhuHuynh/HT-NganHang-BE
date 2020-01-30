var express = require('express');
var middleware = express;
var nJwt = require('njwt');

//middleware auth
middleware.mdw_auth = async function(req, res, next) {
    //Check token
    if (req.headers.token) {
        var verifiedJwt;
        var signingKey = config.app.secretKey;
        try {
            var token = req.headers.token.toString();
            verifiedJwt = nJwt.verify(token, signingKey);
            req.user = verifiedJwt.body;
        } catch (e) {
            console.log(e);
            return res.send({
                status: -999,
                data: {
                    message: 'Invalid token',
                },
            });
        }
    } else {
        return res.send({
            status: -999,
            data: {
                message: 'Invalid token',
            },
        });
    }

    next();
};

module.exports = middleware;
