var express = require('express');
var per_helper = express;
var db = require('../models');
var bols = require('../model_bols');

per_helper.permission = {        
        add : 1,
        edit : 2,
        delete : 4,
        view : 8,
        change_status : 16,
        report : 32,
        config : 64,
        export : 128
}

per_helper.get_full_permission_value = async function(){
    var permissions = this.permission;
    var keys = Object.keys(permissions);
    var value = 0;
    for(var i = 0 ; i<keys.length;i++){
        value = value + permissions[keys[i]];
    }
    return value;
}

per_helper.check_permission_val = async function(permission_value, permission){    
    if((permission_value & permission) == permission)
        return true;
    return false;
}

per_helper.get_permission_value_role = async function(id_role, module){
    var result = 0;
    
    var item = await bols.My_model.find('Manage_permission_role', {id_role : id_role, module : module}, '', 1);    
    if(item.length == 1){
        result = item[0].permission_value;        
    }
    else{
        result = 0;
    }

    return result;
}

per_helper.get_permission_value_user = async function(username, module){
    var result = 0;
    var item = await bols.My_model.find('Manage_permission_user', {username : username, module : module}, '', 1);
    if(item.length == 1){
        result = item[0].permission_value;        
    }
    else{
        result = 0;
    }

    return result;
}

//not async
per_helper.auth_permission = function(req, user){
    if(user.permission_type == 'customize'){        
        db.Manage_permission_user.find({username : user.username}, 'module permission_value', function(err, data){
            if(!err){
                req.session.permission = data;
                req.session.save();// callback cần manual session để đồng bộ 
            }
        });
    }
    else{
        db.Manage_role.findById(user.id_role, function(err, role){
            if(!err){
                if(role.is_root == 1){
                    //root thì full quyền
                    db.Manage_module.find({}, 'name', function(err, module_list){
                        if(!err){
                            var per = [];
                            var permissions = per_helper.permission;
                            var keys = Object.keys(permissions);
                            var value = 0;
                            for(var i = 0 ; i<keys.length;i++){
                                value = value + permissions[keys[i]];
                            }

                            for(let i = 0;i< module_list.length;i++){                               
                                module_list[i].permission_value = i;
                                var item = {
                                    module : module_list[i].name,
                                    permission_value :value
                                }                                
                                per.push(item); 
                            } 
                                              
                            req.session.permission = per;
                            req.session.save();// callback cần manual session để đồng bộ                            
                        }                        
                    });
                }
                else{
                    //Nếu không phải root thì check permission theo role
                    db.Manage_permission_role.find({id_role : user.id_role}, 'module permission_value', function(err, data){
                        if(!err){
                            req.session.permission = data;
                            req.session.save();// callback cần manual session để đồng bộ 
                        }
                    });
                }
            }
        });
    }
}

//Add thêm module vào session quyền
per_helper.add_module_to_current_session = function(req, module, permission_value){
    if(req.session.userdata != null && req.session.userdata != undefined){      
        try{ 
            if( req.session.permission != null &&  req.session.permission != undefined){
                var per = req.session.permission;
                var item = {
                    module : module_list[i].name,
                    permission_value :value
                }
                per.push(item);

                req.session.permission = per;
                req.session.save();// callback cần manual session để đồng bộ  
            }   
        }
        catch(ex){
            console.log(ex);
        }      
    }    
}

per_helper.auth_check_permission = async function(req, res, check_permission){
    var result = false; //mặc định không có quyền
    let module = res.locals.adminController;//module đang vào
    
    let user_data = await helpers.auth_helper.get_userdata(req);
    if(user_data){
        let permission_of_user = user_data.permission;
        let find = permission_of_user.find(o => o.module === module);//tìm module trong list quyền của user
        //nếu tìm thấy thì check quyền
        if(find){
            if((find.permission_value & check_permission) == check_permission){
                result = true;
            }
        }

        if(result == false){
            return helpers.helper.redirect(res, '/adminpanel/error/101');// status 101 là không có quyền
        }    
    }
    else{
        let logout = await helpers.auth_helper.delete_userdata(req);
        return helpers.helper.redirect(res, '/adminpanel/');//Không có data đăng nhập thì clear session đá ra ngoài luôn
    }
}

//Check quyền với module chỉ định
per_helper.deep_check_permission = async function(req, res, module, check_permission){

    var result = false; //mặc định không có quyền    
    let user_data = await helpers.auth_helper.get_userdata(req);
    if(user_data){
        let permission_of_user = user_data.permission;
        let find = permission_of_user.find(o => o.module === module);//tìm module trong list quyền của user
        //nếu tìm thấy thì check quyền
        if(find){
            if((find.permission_value & check_permission) == check_permission){
                result = true;
            }
        }

        if(result == false){
            return helpers.helper.redirect(res, '/adminpanel/error/101');// status 101 là không có quyền
        }    
    }
    else{
        let logout = await helpers.auth_helper.delete_userdata(req);
        return helpers.helper.redirect(res, '/adminpanel/');//Không có data đăng nhập thì clear session đá ra ngoài luôn
    }
}


module.exports = per_helper;