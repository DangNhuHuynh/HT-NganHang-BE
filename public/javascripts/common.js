function empty_all_fields(){
    $('input[type=text], textarea').val('');
}

function generate_csrf_token_form(csrf){
    $('form').append('<input type="hidden" name="_csrf" value="' + csrf + '">');
}

function reload_csrf_token(){
    var data = $.cookie("CSRF-TOKEN");
    $('input[name="_csrf"]').val(data);
    return data;
}

function gotoUrlWithHash(strUrlDetail) {
    var returnUrl = encodeURIComponent($(location).attr('href'));
    if (strUrlDetail.indexOf("?") > 0)
        window.location = strUrlDetail + '&returnUrl=' + returnUrl;
    else
        window.location = strUrlDetail + '?returnUrl=' + returnUrl;
}