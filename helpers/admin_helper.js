var express = require('express');
var admin_helper = express;
var db = require('./../models');
var bols = require('./../model_bols');
const crypto = require('crypto');

 /**
 * @api {function} get_returnUrl Get returnUrl
 * @apiName get_returnUrl
 * @apiDescription Lấy param returnUrl có xử lý refix dùng quay vê trang trước.
 * @apiGroup admin_helper
 * @apiVersion 1.0.0
 * @apiParam {Object} req Thông tin request.
 * @apiParam {Object} res Thông tin response.
 *
 */

admin_helper.get_returnUrl = function(req, res){
    //quay về trang trước
    var returnUrl = req.query.returnUrl;
    if(!returnUrl)
    {
        returnUrl = __baseUrl + '/adminpanel/' + res.locals.adminController;
    }

    return returnUrl;
}

admin_helper.define_controller_action = async function(req, res){
    let org = req.originalUrl;    
    org = org.replace(__baseUrl + '/adminpanel/', '');    
    var arr = org.split('/');    
    
    res.locals.adminControllerIndex = __baseUrl + '/adminpanel/' + arr[0] + '/';      
    res.locals.adminController = arr[0];
    try{
        res.locals.adminAction = arr[1].split('?')[0]; 
    }
    catch(e){
        res.locals.adminAction = '';
    }
    
    var data = {
        controller : arr[0],
        action : arr[1].split('?')[0]
    };

    return data;
}

admin_helper.write_log_admin = async function(req, res, user_data, controller, action){
    if(controller != 'manage_admin_log' || (controller != 'base' && action != 'list_page'))
    {
        try{
            //log admin tool
            var param = '';
            param += JSON.stringify(req.query);        
            param += JSON.stringify(req.body); 
            
            
            param = param.replace(/{/gi, "");        
            param = param.replace(/}/gi, "");        

            if((controller == 'manage_user' || controller == 'profile') && param != '')
            {
                const hash = crypto.createHash('sha256');
                hash.update(param);//encode data liên quan personal
                param = hash.digest('hex');
            }

            let data_log = {
                created : user_data.username,
                modified : user_data.username,
                module : controller,
                action : action,
                href : req.originalUrl,
                param : param,
                ip : helpers.helper.get_client_ip(req)
            }                
            let add_log = await bols.My_model.create(req, 'Manage_admin_log', data_log);
        }
        catch(e){}
    }
}

module.exports = admin_helper;