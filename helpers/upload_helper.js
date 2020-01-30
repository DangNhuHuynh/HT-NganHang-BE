var express = require('express');
var upload_helper = express;
var request = require('request');
var path = require('path');

upload_helper.upload_csv = function(req, res, cb){ 
    var data = {};
    if(req.files != undefined)
    {
        var file_upload_name = req.files.file.name;
        var mimeType = req.files.file.mimetype;
        var encoding = req.files.file.encoding;
        if(file_upload_name && mimeType == 'application/vnd.ms-excel' && encoding == '7bit')
        {
            if(path.extname(file_upload_name) == '.csv'){
                var fcsv = req.files.file;

                var init = helpers.helper.init_file_name('csv', 'crmdata', 'crm');
                var file_name = init.file_name;
                var db_file_name = init.db_file_name;

                fcsv.mv(file_name, function(err) {
                    if (err){
                        data.result = 0;
                        data.message = err.message;
                    }
                    else{
                        data.result = 200;
                        data.message = db_file_name;
                        data.file_upload_name = file_upload_name;
                    }                    

                    cb(data);
                });
            }
            else{
                data.result = 0;
                data.message = 'Chỉ chấp nhận file định dạng CSV';    
                cb(data);
            }
        }
        else{
            data.result = 0;
            data.message = 'Data upload không hợp lệ';
            cb(data);
        }
    }
    else{
        data.result = 0;
        data.message = 'Không tìm thấy data upload';
        cb(data);
    }   
}


upload_helper.upload_excel = function(req, res, cb){ 
    var data = {};
    if(req.files != undefined)
    {
        console.log(req.files);
        var file_upload_name = req.files.file.name;
        var mimeType = req.files.file.mimetype;
        var encoding = req.files.file.encoding;
        if(file_upload_name && mimeType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && encoding == '7bit')
        {
            if(path.extname(file_upload_name) == '.xlsx'){
                var fcsv = req.files.file;

                var init = helpers.helper.init_file_name('xlsx', 'crmdata', 'crm');
                var file_name = init.file_name;
                var db_file_name = init.db_file_name;

                fcsv.mv(file_name, function(err) {
                    if (err){
                        data.result = 0;
                        data.message = err.message;
                    }
                    else{
                        data.result = 200;
                        data.message = db_file_name;
                        data.file_upload_name = file_upload_name;
                    }                    

                    cb(data);
                });
            }
            else{
                data.result = 0;
                data.message = 'Chỉ chấp nhận file định dạng XLSX';    
                cb(data);
            }
        }
        else{
            data.result = 0;
            data.message = 'Data upload không hợp lệ';
            cb(data);
        }
    }
    else{
        data.result = 0;
        data.message = 'Không tìm thấy data upload';
        cb(data);
    }   
}


upload_helper.upload_photo = function(req, res, large_w, large_h, thumb_w, thumb_h, cb){    
    var data = {};
    if(req.files != undefined)
    {
        var file_upload_name = req.files.file.name;
        var mimeType = req.files.file.mimetype;
        var encoding = req.files.file.encoding;
        if(file_upload_name && (mimeType == 'image/jpeg' || mimeType == 'image/jpg' || mimeType == 'image/png') && encoding == '7bit')
        {
            if(path.extname(file_upload_name).toLowerCase() == '.jpg' || path.extname(file_upload_name).toLowerCase() == '.jpeg' || path.extname(file_upload_name).toLowerCase() == '.png' ){
                var ex = path.extname(file_upload_name).toLowerCase();
                ex = ex.replace('.','');
                var fimage = req.files.file;

                var init = helpers.helper.init_file_name(ex, 'photos', 'crm');
                var file_name = init.file_name;
                var db_file_name = init.db_file_name;

                fimage.mv(file_name, function(err) {
                    if (err){
                        data.result = 0;
                        data.message = err.message;
                    }
                    else{
                        var file_name_thumb = file_name.replace('.', '_thumb.');
                        var file_name_large = file_name.replace('.', '_large.');
                        helpers.image_helper.image_resize(file_name, file_name_thumb, thumb_w, thumb_h);
                        helpers.image_helper.image_resize(file_name, file_name_large, large_w, large_h);

                        data.result = 200;
                        data.message = db_file_name;
                        data.file_upload_name = file_upload_name;
                    }
                    
                    cb(data);
                });
            }
            else{
                data.result = 0;
                data.message = 'Chỉ chấp nhận file định dạng jpg/jpeg hoặc png';    
                cb(data);
            }
        }
        else{
            data.result = 0;
            data.message = 'Data upload không hợp lệ';
            cb(data);
        }
    }
    else{
        data.result = 0;
        data.message = 'Không tìm thấy data upload';
        cb(data);
    }   
}

module.exports = upload_helper;