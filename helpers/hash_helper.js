var express = require('express');
var hash_helper = {};
var request = require('request');
const crypto = require('crypto');
const sha256 = require('sha256');
const NodeRSA = require('node-rsa');

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

var public_key = `-----BEGIN PUBLIC KEY-----\n
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArMMafDts7eKgdMSoR/Vp\n
DeisBRCuP2KFk2PRzgXa/3IdTKyaq9rfVC71p4ZDUaf1LBQMxHp8j14nKLV+OiYp\n
BHlU/7BxyKu0hK4LcBxpGN6HyTlUv1JvAUn+JVuIuyqsa306NFhsXgVFZmu7DIjI\n
9OAv+/fgZXp4M9iCw/60PCB5j0NeXrBb5lx+2ltY9suSDtD9dmitJraKzVnXg0M4\n
gD0Y230ohWZ7pNuJqEA97Ph+qDXbQwuw82TG40oHYiQ/O7YLPnHo3YN5WQTzghG/\n
Cex60Ul+Gv3qmSC/ckxYTISuvKdzoQq0/VkhU+gnvQ/6KI8eFND3bHXmJEA/bZ8X\n
ZwIDAQAB\n
-----END PUBLIC KEY-----`;

var private_key =  `-----BEGIN RSA PRIVATE KEY-----\n
MIIEowIBAAKCAQEArMMafDts7eKgdMSoR/VpDeisBRCuP2KFk2PRzgXa/3IdTKya\n
q9rfVC71p4ZDUaf1LBQMxHp8j14nKLV+OiYpBHlU/7BxyKu0hK4LcBxpGN6HyTlU\n
v1JvAUn+JVuIuyqsa306NFhsXgVFZmu7DIjI9OAv+/fgZXp4M9iCw/60PCB5j0Ne\n
XrBb5lx+2ltY9suSDtD9dmitJraKzVnXg0M4gD0Y230ohWZ7pNuJqEA97Ph+qDXb\n
Qwuw82TG40oHYiQ/O7YLPnHo3YN5WQTzghG/Cex60Ul+Gv3qmSC/ckxYTISuvKdz\n
oQq0/VkhU+gnvQ/6KI8eFND3bHXmJEA/bZ8XZwIDAQABAoIBADokTz2QIlDM/INP\n
y/KrvPdZXss1me7rEVlRNsLHZbSiiwnK7SL5Pj/ure37WZyZkgGLneBh+JmnbjZd\n
HmYjgZpn2xtSHnkSkGY2zNKmPRiJi9lE2iipbYJZjJa1/4Y+Dlj+hCApwg7CZ2DY\n
0NKfFkKTUJLUEUkVtm58Z0Xe6nlxRnFiRyLmw5qzmKs3qnNx1d/11BjCMLgTn/KR\n
Vg3FZ4B3j4cVBVaU88QLyNCYPoeeaEow3OvDWoHMX2s9VzUTmnqipEmjTRtFIY7B\n
wyvd6PVq7LoGUidGzJMGLrcJIjJMro/sdx9emxT8yhc7PzHImm4KEMV/kpIzfma0\n
7+d8GgECgYEA5C8THkyFGICmKgAN3c3UfNK7Akd0IgWnMaPCrCKWRIgM4m/AeHfm\n
Jgf7RiuqXARVST4n9mXINwQC4dTfGCY7pUW190xutvvGS5KwsFl/6VEv+NQ3qTod\n
r4Ca8KSyMRXTsBpAKHQRY4tYF2+zAzCYlregst+KkyYM2s4YKIG3jMcCgYEAwdJ7\n
67LssldsAjnYmrHIdGPI3WS86AzcL2Yd5OlRPo5wGLkf/aMoAKOo3arQk6JKEcBN\n
gnpHBl0+CeyQO8+biYvO4KPVbqAQmVkX+jPK4mdxjJwAU49WqyZrOzJZ4i7Pz/fL\n
ZuUJuZYgP5uIi1+G8Gj8i+XhXXnfzFsKBVIXQGECgYAoAkUE4//WOwBnjtjfki52\n
sHBPxv2K1ZjqMD969RmJ7JztuxBxTvyQoIejVxaoya22iOpy3ofLda2XsT5oupNs\n
uBtewA0NknnDWHYYhajS3QRfSb50spbv5cnE9eu0hZI3Z3LmZOuDm7QXb+NgZM3s\n
Z0gK9P0ULfDFEKvVtmDbkwKBgCH/sg0eTbba7u9VBlHcbbU867cqPJjX6KfH2eaV\n
ptK6WZ98mcf8HsA99RktJXlANo32laIVoO/U21USUhqryDTQeXGeS4okOcUsg7A3\n
9ZbRXnGzy7rcoe9TxeuUYX/zhjCM3vklpBcR5oZB2inYj+sL/4DqyiWDg2ZtccyN\n
IdcBAoGBAND9JEHbyop93nGv/62DuIoI+BaMpAFx2OrPAK0yC1K/sP0d+ksKBo4A\n
SeM7pdB/mPILt2qUMqG3C0jOSHPd7+tpRXTMIkEj6hb0BZEusXPcrU8UKVCKcWeX\n
yDd+xQIEYWtRMsk6d3XNY95Phh+HNmtMLREKnLFT8cWXXRLrZ1QU\n
-----END RSA PRIVATE KEY-----`;

hash_helper.encryptedRSA = function(public_key, data) {
    let key_public = new NodeRSA(public_key);
    const encryptedString = key_public.encrypt(data, 'base64');
    return encryptedString;
}

hash_helper.decrypedRSA = function(data) {
    let key_private = new NodeRSA(private_key);
    const decryptedString = key_private.decrypt(data, 'utf8');
    return decryptedString;
}

module.exports = hash_helper;