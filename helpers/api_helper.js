var express = require("express");
var api_helper = {};

api_helper.permission = {        
    create : 1,
    update : 2,
    mapping : 4,
    getinfo : 8
}

api_helper.get_full_permission_value = async function(){
    var permissions = this.permission;
    var keys = Object.keys(permissions);
    var value = 0;
    for(var i = 0 ; i<keys.length;i++){
        value = value + permissions[keys[i]];
    }
    return value;
}

api_helper.check_permission_val = async function(permission_value, permission){    
    if((permission_value & permission) == permission)
        return true;
    return false;
}

api_helper.get_permission_value_oa = async function(oa_id){
    var result = 0;
    var item = await bols.My_model.find('Crm_app_connect', { oa_id : oa_id }, '', 1);
    if(item.length == 1){
        result = item[0].permission_value;         
    }
    else{
        result = 0;
    }

    return result;
}


module.exports = api_helper;