var express = require('express');
var helper = {};
var db = require('./../models');
var bols = require('./../model_bols');
var moment = require('moment');
var mkdirp = require('mkdirp');
var nconf = require('nconf');
var nodemailer = require('nodemailer');
var nJwt = require('njwt');
nconf.argv().env().file({ file: __base + 'config_setting/config.json' });

/**
 * @api {function} redirect Chuyển trang redirect
 * @apiName redirect
 * @apiDescription Dùng hàm này chuyển trang để xử lý vụ refix
 * @apiGroup helper
 * @apiVersion 1.0.0
 * @apiParam {object} res Thông tin response.
 * @apiParam {String} path Thông tin path để chuyển tới, ví dụ: '/adminpanel/manageuser/'
 */
helper.redirect = function (res, path) {
    return new Promise(function (resolve, reject) {
        path = path.replace(__baseUrl, '');
        res.redirect(__baseUrl + path);
    });
}


//show trang 404
helper.show_404 = function (res) {
    res.redirect(__baseUrl + '/handle-error/error/404');
}

//show trang 500
helper.show_500 = function (res) {
    res.redirect(__baseUrl + '/handle-error/error/500');
}

helper.set_cache = function (res, second) {
    if (!res.getHeader('Cache-Control'))
        res.setHeader('Cache-Control', 'public, max-age=' + second);
}

//set flash message
helper.set_flash_message = function (req, type, msg) {
    req.session.message = { type: type, msg: msg };
    console.log("set " + JSON.stringify(req.session.message));
}

//get flash message
helper.get_flash_message = function (req) {
    if (req.session.message == undefined || req.session.message == null) {
        return null;
    }
    else {
        var t = req.session.message;
        req.session.message = null;
        return t;
    }
}

//Tạo array giữa 2 ngày
helper.get_array_date = function (startDate, endDate) {
    var dateArray = [];
    var start = new Date(this.standard_datetime(startDate));
    var end = new Date(this.standard_datetime(endDate));

    while (start <= end) {
        dateArray.push(moment(start).format('YYYY-MM-DD'))
        start.setDate(start.getDate() + 1);
    }

    return dateArray;
}

//Trả về thời gian standard của db
helper.standard_datetime = function (d) {
    return moment(d).utcOffset('+0700').format("YYYY-MM-DDTHH:mm:ss.SSSZ"); //req.params.startTime = 2016-09-25 00:00:00
}

//lấy tất cả param query
helper.get_full_query_string = function (req) {
    var query = '';
    var t = 0;
    for (var key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            if (t > 0) {
                query += '&' + key + '=' + req.query[key];
            }
            else {
                query += key + '=' + req.query[key];
            }
        }
        t = t + 1;
    }
    query = '?' + query;
    return query;
}

//bind data vào filter
helper.bind_data_filter = function (req) {
    var filter = {};
    var startDate = req.query.startDate;
    var start = '';
    if (startDate != undefined && startDate != '') {
        startDate = startDate + ' ' + '00:00:00';
        start = this.standard_datetime(startDate);
    }


    var endDate = req.query.endDate;
    var end = '';
    if (endDate != undefined && endDate != '') {
        endDate = endDate + ' ' + '23:59:59';
        end = this.standard_datetime(endDate);
    }

    if (end != '' && start != '') {
        filter.createdAt = { $gte: start, $lte: end };
    }

    for (var key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            if (key != '_csrf' && key != 'startDate' && key != 'endDate' && req.query[key] != '' && req.query[key] != undefined) {
                var val = req.query[key];
                val = val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                filter[key] = val;
            }
        }
    }

    return filter;
}

//add data filter vào where lúc sử dụng aggregate trong mongo
helper.aggregate_data_filter_where = function (where) {
    var filter = {};
    var startDate = where.startDate;
    var start = '';
    if (startDate != undefined && startDate != '') {
        startDate = startDate + ' ' + '00:00:00';
        start = this.standard_datetime(startDate);
    }


    var endDate = where.endDate;
    var end = '';
    if (endDate != undefined && endDate != '') {
        endDate = endDate + ' ' + '23:59:59';
        end = this.standard_datetime(endDate);
    }

    if (end != '' && start != '') {
        filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    for (var key in where) {
        if (where.hasOwnProperty(key)) {
            if (key != 'startDate' && key != 'endDate' && where[key] != '' && where[key] != undefined) {
                filter[key] = where[key];
            }
        }
    }

    return filter;
}


//gắn data vào whwre truy vấn mongo thông thường
helper.bind_data_where = function (where) {
    var filter = {};
    var startDate = where.startDate;
    var start = '';
    if (startDate != undefined && startDate != '') {
        startDate = startDate + ' ' + '00:00:00';
        start = this.standard_datetime(startDate);
    }


    var endDate = where.endDate;
    var end = '';
    if (endDate != undefined && endDate != '') {
        endDate = endDate + ' ' + '23:59:59';
        end = this.standard_datetime(endDate);
    }

    if (end != '' && start != '') {
        filter.createdAt = { $gte: start, $lte: end };
    }

    for (var key in where) {
        if (where.hasOwnProperty(key)) {
            if (key != 'startDate' && key != 'endDate' && where[key] != '' && where[key] != undefined) {
                filter[key] = where[key];
            }
        }
    }

    return filter;
}

//Tạo chuỗi báo lỗiss
helper.validator_error_message = function (errors) {
    let message = '';
    errors.forEach((err) => {
        message += err.msg;
        message += '<br>';
    });
    return message;
}

//list các kiểu trạng thái
helper.status_list = function (first = 'Active') {
    if (first == 'Active') {
        return [
            { name: 'Active', value: 1 },
            { name: 'Pending', value: 0 },
            { name: 'Disable', value: -1 }
        ];
    }
    else if (first == 'Pending') {
        return [
            { name: 'Pending', value: 0 },
            { name: 'Active', value: 1 },
            { name: 'Disable', value: -1 }
        ];
    }
    else if (first == 'Disable') {
        return [
            { name: 'Disable', value: -1 },
            { name: 'Pending', value: 0 },
            { name: 'Active', value: 1 }
        ];
    }
    else {
        return [
            { name: 'Active', value: 1 },
            { name: 'Pending', value: 0 },
            { name: 'Disable', value: -1 }
        ];
    }
}

//cate của article
helper.type_cate_list = function (first = 'All') {
    if (first == 'All') {
        return [
            { name: 'All', value: 0 },
            { name: 'Internal', value: 1 },
            { name: 'By OA', value: 2 }
        ];
    }
    else if (first == 'Internal') {
        return [
            { name: 'Internal', value: 1 },
            { name: 'All', value: 0 },
            { name: 'By OA', value: 2 }
        ];
    }
    else if (first == 'By OA') {
        return [
            { name: 'By OA', value: 2 },
            { name: 'Internal', value: 1 },
            { name: 'All', value: 0 }
        ];
    }
    else {
        return [
            { name: 'All', value: 0 },
            { name: 'Internal', value: 1 },
            { name: 'By OA', value: 2 }
        ];
    }
}

//list kiêm dropdown yes/no
helper.confirm_list = function () {
    return [
        { name: 'No', value: 0 },
        { name: 'Yes', value: 1 }
    ]
}


helper.view_data = function (data) {
    let r = '';
    if (data != undefined && data != '') {
        r = data;
    }
    return r;
}

//lấy ip client
helper.get_client_ip = function (req) {
    var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    return ip;
}

//tạo chuỗi string theo time
helper.get_string_time = function () {
    let date = new Date();
    return moment(date).format('YYYYMMDDHHmmssSS');
}

//Khởi tạo file name default
helper.init_file_name = function (extension, sub_path = '', refix = '') {
    let date = new Date();
    let path = __base + 'medias' + '/' + sub_path + '/' + moment(date).format('YYYY/MM/DD/'); //path tương đối

    try {
        mkdirp.sync(path);
    } catch (e) {
        console.log(e.message);
    }

    var file_name = path;//tạo file name kèm path luôn
    var db_file_name = moment(date).format('YYYY/MM/DD/');

    if (refix != '') {
        file_name = file_name + refix + '_';
        db_file_name = db_file_name + refix + '_';
    }
    else {
        file_name = file_name + 'media_';
        db_file_name = db_file_name + 'media_';
    }
    var rd = helpers.helper.get_random_int(1, 999) + '';
    var formattedDate = moment(date).format('YYYYMMDDHHmmssSSS');
    file_name += formattedDate;
    file_name += rd;
    db_file_name += formattedDate;
    db_file_name += rd;


    file_name += '.' + extension;
    db_file_name += '.' + extension;

    var data = {
        file_name: file_name,
        db_file_name: db_file_name
    }


    return data;
}

//khởi tạo filename vào folder private
helper.init_private_file_name = function (extension, sub_path = '', refix = '') {
    let date = new Date();
    let path = __base + 'medias_private' + '/' + sub_path + '/' + moment(date).format('YYYY/MM/DD/'); //path tương đối

    try {
        mkdirp.sync(path);
    } catch (e) {
        console.log(e.message);
    }

    var file_name = path;//tạo file name kèm path luôn
    var db_file_name = moment(date).format('YYYY/MM/DD/');

    if (refix != '') {
        file_name = file_name + refix + '_';
        db_file_name = db_file_name + refix + '_';
    }
    else {
        file_name = file_name + 'media_';
        db_file_name = db_file_name + 'media_';
    }
    var rd = helpers.helper.get_random_int(1, 999) + '';
    var formattedDate = moment(date).format('YYYYMMDDHHmmssSSS');
    file_name += formattedDate;
    file_name += rd;
    db_file_name += formattedDate;
    db_file_name += rd;

    file_name += '.' + extension;
    db_file_name += '.' + extension;

    var data = {
        file_name: file_name,
        db_file_name: db_file_name
    }
    return data;
}

//Lấy ảnh thumb
helper.get_thumb_image = function (url) {
    return url.replace(/./gi, '_thumb.');;
}

//Lấy ảnh to
helper.get_large_image = function (url) {
    return url.replace(/./gi, '_large.');;
}

//data kiểu hình
helper.is_image = function (data) {
    const isImage = require('is-image');
    data = '' + data;
    return isImage(data);
}

//Sử dụng cho frontend
helper.frontend_set_menu_active = function (res, key_name) {
    res.locals.active_menu = key_name;
}

//Chuyển 1 string sang slug
helper.to_slug = function (str) {
    // Chuyển hết sang chữ thường
    str = str.toLowerCase();

    // xóa dấu
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');

    // Xóa ký tự đặc biệt
    str = str.replace(/([^0-9a-z-\s])/g, '');

    // Xóa khoảng trắng thay bằng ký tự -
    str = str.replace(/(\s+)/g, '-');

    // xóa phần dự - ở đầu
    str = str.replace(/^-+/g, '');

    // xóa phần dư - ở cuối
    str = str.replace(/-+$/g, '');

    // return
    return str;
}

//Tạo lại số phone hợp lệ
helper.rebuild_valid_phone_number = function (phone) {
    var r = /^\d{9,13}$/;
    phone = phone + '';
    phone = phone.trim();
    if (r.test(phone)) {
        var f_84 = phone.indexOf('84');
        if (f_84 == 0) {
            return phone;
        }
        else {
            var f_0 = phone.indexOf('0');
            if (f_0 == 0) {
                phone = phone.substring(1);
                phone = '84' + phone;
                return phone;
            }
            else {
                phone = '84' + phone;
                return phone;
            }
        }
    }
    else {
        return phone;
    }
}

//format ngày tháng
helper.format_date = function (strDate, strformat = 'YYYY-MM-DD') {
    var date_format = new Date(strDate);
    return moment(date_format).format(strformat);
}

//Lấy giá trị config
helper.get_config = function (key) {
    return nconf.get(key);
}

//Kiểm tra OA có phải của 1 user zalo - hoặc oa có bị khóa hay không
helper.check_oa_of_user = async function (req) {
    // Check oa thuoc contract cua user khong
    let oa_id = req.params.oa_id;
    let oa = null;
    let contract_id = req.query.contract_uuid;
    var list_oa_register = {};
    var list_oa = {};
    var arr_Zalo_id = {};
    if (contract_id) {
        arr_Zalo_id = await bols.My_model.find_all('Crm_register_n_contract', { 'contract_uuid': contract_id }, 'zalo_id');

        if (arr_Zalo_id) {
            var temp = [];
            for (var i = 0; i < arr_Zalo_id.length; i++) {
                temp.push(arr_Zalo_id[i].zalo_id);
            }

            list_oa_register = await bols.My_model.find_all('Crm_oa_n_register', { 'zalo_id': { $in: temp } }, 'oa_id');

            temp = [];
            for (var i = 0; i < list_oa_register.length; i++) {
                temp.push(list_oa_register[i].oa_id);
            }

            list_oa = await bols.My_model.find_all('Crm_oa_info', { 'oa_id': { $in: temp } });
        }

        if (list_oa.length > 0) {
            var find_oa = list_oa.find(o => o.oa_id === oa_id);
            if (find_oa) {
                oa = find_oa;
                return oa;
            }
            else {
                return null;
            }
        }
    }
    return null;
}

//Kiểm tra OA có đang hoạt động hay không?
helper.check_oa_is_active = async function (req) {
    let oa_id = req.params.oa_id;
    var result = true;

    //chỉ check những function cần thông tin oa
    if (oa_id != undefined && oa_id != '') {
        var oa = await bols.My_model.find_first('Crm_oa_info', { oa_id: oa_id, status: 1 });
        if (oa) {
            result = true;
        }
        else {
            result = false;
        }
    }

    return result;
}

//check https
helper.exist_https = function (data) {
    var value = data.search("https");
    if (value != -1)
        return true;
    return false;
}

//chuyen time theo chuẩn zalo
helper.to_timestamp_from_age = function (age) {
    var now = new Date();
    var t = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (age * 365)).getTime();
    t = t / 1000;
    return t;
}

helper.random_array = function (myArray) {
    var rand = myArray[Math.floor(Math.random() * myArray.length)];
    return rand;
}

helper.group_count_array = function (array) {
    var testdata = array;
    var i = 0, x, count, item;
    while (i < testdata.length) {
        count = 1;
        item = testdata[i];
        x = i + 1;

        while (x < testdata.length && (x = testdata.indexOf(item, x)) != -1) {
            count += 1;
            testdata.splice(x, 1);
        }

        testdata[i] = {
            index: testdata[i],
            count: count
        };
        ++i;
    }
    return testdata;
}

helper.sub_string = function (str, l) {
    var tempt = "";
    if (str.length > l) {
        tempt = str.substring(0, l);
        var tempt_index = tempt.lastIndexOf(" ", tempt.length);
        tempt = tempt.substring(0, tempt_index);
    }
    else {
        tempt = str;
    }

    return tempt;
}


helper.get_random_int = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// payload = {
//     a: 'asd',
//     b: 'asdqwe',
//     ...
// }
// Time tính theo ngày
helper.renderToken = function (secretKey, payload, time = 1) {
    // create signingKey
    var signingKey = secretKey;

    // Payload
    var claims = payload;

    var jwt = nJwt.create(claims, signingKey);

    // Thời hạn 1h
    var expire = new Date().getTime();
    expire = expire + time * 24 * 60 * 60 * 1000;
    // jwt tự chia lại cho 1000
    jwt.setExpiration(expire);

    // Token
    var token = jwt.compact();

    return token;
}

helper.sendMail = function (mailOptions) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'doduyphuong433@gmail.com',
            pass: 'phuong828230'
        }
    });

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

helper.randomString = function(characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', length) {
    var result = '';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = helper;