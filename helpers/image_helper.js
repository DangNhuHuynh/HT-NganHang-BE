var express = require('express');
var image_helper = express;
var request = require('request');
var Jimp = require("jimp");

image_helper.image_resize = function(read_file, new_file, w, h){
    Jimp.read(read_file, function (err, image) {
        if (err) { 
            console.log(err.message);
            throw err;         
        };
        var w_root = image.bitmap.width; //  width of the image
        var h_root = image.bitmap.height; // height of the image
        if (w_root > w || h_root > h)
        {
            var rate = parseFloat(w / w_root);
            var tempt = parseFloat(h / h_root);
            if (tempt < rate) rate = tempt;
            w_root = parseInt(w_root * rate);
            h_root = parseInt(h_root * rate);
        }       

        image.resize(parseInt(w_root), parseInt(h_root))            // resize
            .quality(70)                 // set JPEG quality
            .write(new_file); // save
    });
}

image_helper.write_base64_to_image = function(req, res, extension, sub_path, large_w, large_h, thumb_w, thumb_h, refix = '', cb){ 
    var result = false;
    var data_file = '';
    var base64Data = req.body.qqfile;
    base64Data = base64Data.replace(/^data:image\/png;base64,/, "");
    base64Data = base64Data.replace(/^data:image\/jpg;base64,/, "");
    base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, "");
    var init = helpers.helper.init_file_name(extension, sub_path, refix);
    var file_name = init.file_name;
    var db_file_name = init.db_file_name;
    var file_name_thumb = file_name.replace('.','_thumb.');
    var file_name_large = file_name.replace('.','_large.');

    require("fs").writeFile(file_name, base64Data, 'base64', function(err) {
        if(!err){
            image_helper.image_resize(file_name, file_name_thumb, thumb_w, thumb_h);
            image_helper.image_resize(file_name, file_name_large, large_w, large_h);

            result = true;
            data_file = db_file_name

            var data = {
                result : result,
                data : data_file
            };

            cb(data);
        }
        else{
            var data = {
                result : err.code,
                data : err.message
            };

            cb(data);
        }
    });
}

module.exports = image_helper;