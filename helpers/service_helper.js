var express = require('express');
var service_helper = {};
var request = require('request');
const JSONbig = require('json-bigint')
const JSONstrict = require('json-bigint')({
	"strict": true
})
const JSONbigString = require('json-bigint')({
	"storeAsString": true
})

 

 /**
 * @api {function} call_recaptcha_api Tương tác recaptcha api.
 * @apiName call_recaptcha_api
 * @apiGroup service_helper
 * @apiVersion 1.0.0
 * @apiParam {Object} req Thông tin request.
 * @apiParam {Object} res Thông tin response.
 *
 */

service_helper.call_recaptcha_api = async function(req, res){ 
    return new Promise(function (resolve, reject) {
        let g_response = req.body['g-recaptcha-response'];
        let url = 'https://www.google.com/recaptcha/api/siteverify?secret=' + res.locals.recaptcha.secretkey + '&response=' + g_response;
        
        let options = {
            url: url,            
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-type': 'application/json; charset=utf-8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; pl; rv:1.9.2.13) Gecko/20101203 Firefox/3.5.13',
                'Cookie': 'sagree=true; JSESSIONID=9EC7D24A64808F532B1287FFDDCDEC44',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        if(config.app.proxy != ''){    
            options.proxy = config.app.proxy; 
        }  

        request(options, function (error, res, body) {
          if (!error && res.statusCode == 200) {
            try{
                resolve(JSONbigString.parse(body));
            }
            catch(e){
                resolve(body);
            }
          } else {
            reject(error);
          }
        });
    });    
}

service_helper.http_request_api = async function(req, res, url){ 
    return new Promise(function (resolve, reject) {              
        let options = {
            url: url,        
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-type': 'application/json; charset=utf-8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; pl; rv:1.9.2.13) Gecko/20101203 Firefox/3.5.13',
                'Cookie': 'sagree=true; JSESSIONID=9EC7D24A64808F532B1287FFDDCDEC44',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        if(config.app.proxy != ''){    
            options.proxy = config.app.proxy; 
        }  

        request(options, function (error, res, body) {
          if (!error && res.statusCode == 200) {
              try{
                resolve(JSONbigString.parse(body));
              }
              catch(e){
                resolve(body);
              }            
          } else {
            resolve(error);
          }
        });
    });    
}

service_helper.http_request_post_api = async function(req, res, url, body){ 
    return new Promise(function (resolve, reject) {              
        let options = {
            url: url,        
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-type': 'application/json; charset=utf-8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; pl; rv:1.9.2.13) Gecko/20101203 Firefox/3.5.13',
                'Cookie': 'sagree=true; JSESSIONID=9EC7D24A64808F532B1287FFDDCDEC44',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body : body
        };

        if(config.app.proxy != ''){    
            options.proxy = config.app.proxy; 
        }  

        request.post(options, function (error, res, body) {
          if (!error && res.statusCode == 200) {
            try{
                resolve(JSONbigString.parse(body));
            }
            catch(e){
            resolve(body);
            }
          } else {
            resolve(error);
          }
        });
    });    
}

service_helper.http_request = function (params, callback = null) {
    //call request
    if(!params.url) return false;

    let options = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json; charset=utf-8',
            'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; pl; rv:1.9.2.13) Gecko/20101203 Firefox/3.5.13',
            'Cookie': 'sagree=true; JSESSIONID=9EC7D24A64808F532B1287FFDDCDEC44',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    options.url = params.url;
    if(params.method == "POST"){
        options.method = "POST";
        options.json = true;
        options.body = params.data;
    }

    if(config.app.proxy != ''){
        options.proxy = config.app.proxy;
    }

    request(options,function(err, response, body) {
        if(callback){
            if(err){
                return callback(err);
            }
            return callback(body);
        }
    });
};



module.exports = service_helper;