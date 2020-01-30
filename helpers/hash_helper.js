var express = require('express');
var hash_helper = {};
var request = require('request');
const crypto = require('crypto');
const sha256 = require('sha256');

/**
 * @api {function} aes_encrypt AES encrypt
 * @apiName aes_encrypt
 * @apiDescription Mã hóa theo chuẩn AES
 * @apiGroup hash_helper
 * @apiVersion 1.0.0
 * @apiParam {String} data Thông tin cần mã hóa.
 * @apiParam {String} secretKey Thông tin mã bí mật.
 *
 */

hash_helper.aes_encrypt = function(data, secretKey){
    try{
        const cipher = crypto.createCipher('aes192', secretKey);
        var encrypted = cipher.update(data,'utf8', 'hex');
        encrypted += cipher.final('hex');  
        return encrypted;
    }
    catch(e){
        return '';
    }    
}


/**
 * @api {function} aes_encrypt AES decrypt
 * @apiName aes_decrypt
 * @apiDescription Giải mã theo chuẩn AES
 * @apiGroup hash_helper
 * @apiVersion 1.0.0
 * @apiParam {String} data Thông tin cần giải mã.
 * @apiParam {String} secretKey Thông tin mã bí mật.
 *
 */
hash_helper.aes_decrypt = function(data, secretKey){
    try{
        const decipher = crypto.createDecipher('aes192', secretKey) 
        var decrypted = decipher.update(data,'hex','utf8') 
        decrypted += decipher.final('utf8');         
        return decrypted; 
    }
    catch(e){
        return '';
    }
}

/**
 * @api {function} sha256 sha256 encrypt
 * @apiName sha256
 * @apiDescription Mã hóa theo chuẩn sha256
 * @apiGroup hash_helper
 * @apiVersion 1.0.0
 * @apiParam {String} data Thông tin cần mã hóa.
 *
 */
hash_helper.sha256 = function(data, disgest = 'hex'){
    return crypto.createHash('sha256').update(data).digest(disgest);
}

/**
 * @api {function} md5 md5 encrypt
 * @apiName md5
 * @apiDescription Mã hóa theo chuẩn md5
 * @apiGroup hash_helper
 * @apiVersion 1.0.0
 * @apiParam {String} data Thông tin cần mã hóa.
 *
 */
hash_helper.md5 = function(data){
    return crypto.createHash('md5').update(data).digest("hex");
}

/**
 * @api {function} sha1 sha1 encrypt
 * @apiName sha1
 * @apiDescription Mã hóa theo chuẩn sha1
 * @apiGroup hash_helper
 * @apiVersion 1.0.0
 * @apiParam {String} data Thông tin cần mã hóa.
 *
 */
hash_helper.sha1 = function(data){
    return crypto.createHash('sha1').update(data).digest("hex");
}


module.exports = hash_helper;