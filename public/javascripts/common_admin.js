$(document).ready(function(){
    
});

function ListPage(current_page, page_size, model, search_fields, filter, order) {                                                
    $.ajax({
        url: '../base/list_page',
        method: 'POST',
        data: {"page": current_page, "page_size": page_size, "model" : model, "filter" : filter, "search_fields" : search_fields, "order" : order, "_csrf" : reload_csrf_token()},
        
        success: function (data) {
            //bind lại csrf vào các input form
            var csrf = reload_csrf_token();

            $("#card-body").html(data);
            window.location.hash = current_page + ";" + page_size;
            
            var total_page = parseInt($('#total_page_' + current_page).html());
            $('#total_page_' + current_page).remove();
            
            var total_item = parseInt($('#total_item_' + current_page).html());
            $('#total_item_' + current_page).remove();
            $('#total_item').html(total_item);

            $('#n_pagination').twbsPagination({                            
                startPage: current_page,
                totalPages: total_page,
                visiblePages: 10,
                onPageClick: function (event, page) {                                                              
                    ListPage(page, page_size, model, search_fields, filter, order);
                }
            });

            cb_all_action('fw_cb_items');
        }

    });
}
    
function LoadDataList(model, page, page_size, search_fields, filter, order) {                
    var hash = window.location.hash.replace('#', '');
    var str_array = new Array();
    str_array = hash.split(';');      
    if(hash){   
        if(str_array.length == 2){
            try{
                page = parseInt(str_array[0]);
            }
            catch(e){
                page = 1;
            }
            
            try{
                page_size = parseInt(str_array[1]);
            }
            catch(e){
                page_size = 10;
            }
            
        }        
    }            
    ListPage(page, page_size, model, search_fields, filter, order); //Load data lần đầu theo url                                  
}


function show_message(type, message){
    $(document).ready(function(){
        $('#message_box').fadeIn(1000);
        $('#message_box').html('<span class="icon-star"></span>' + ' ' + message);
        if(type == 'success')
        {
            $('#message_box').addClass('alert-success');
        }
        else if(type == 'error'){
            $('#message_box').addClass('alert-danger');
        }

        setInterval(function(){ $('#message_box').fadeOut(3000); }, 4000);
    });    
}

function cb_all_action(cb_item_name){
    $("#fw_cb_all").click(function() {            
        var $box = $(this);
        if ($box.is(":checked")) {              
            var group = "input:checkbox[name='" + cb_item_name + "']";          
            $(group).prop('checked', true);       
        } else {
            var group = "input:checkbox[name='" + cb_item_name + "']";
            $(group).prop('checked', false);              
        }
    });
}

function fw_export(module){
    var returnUrl = encodeURIComponent($(location).attr('href'));
    var url = baseUrl + '/adminpanel/base/export/' + module + '?returnUrl=' + returnUrl;
    $('#form_filter').attr('action', url);
    $('#form_filter').submit();
}

function fw_delete_list_id(module, cb_item_name){
    if(fw_check_have_selected_item(cb_item_name))   
    {
        var returnUrl = encodeURIComponent($(location).attr('href'));
        module = module.toLowerCase();
        var url = baseUrl + '/adminpanel/base/delete_list_id/' + module + '?returnUrl=' + returnUrl;
        $('#fw_form_action').attr('action', url);
        $('#fw_form_action').submit();
    }
}

function fw_active_list_id(module, cb_item_name){
    if(fw_check_have_selected_item(cb_item_name))   
    {
        var returnUrl = encodeURIComponent($(location).attr('href'));
        module = module.toLowerCase();
        var url = baseUrl + '/adminpanel/' + module + '/active_list_id' + '?returnUrl=' + returnUrl;
        $('#fw_form_action').attr('action', url);
        $('#fw_form_action').submit();
    }
}

function fw_inactive_list_id(module, cb_item_name){
    if(fw_check_have_selected_item(cb_item_name))   
    {
        var returnUrl = encodeURIComponent($(location).attr('href'));
        module = module.toLowerCase();
        var url = baseUrl + '/adminpanel/' + module + '/inactive_list_id' + '?returnUrl=' + returnUrl;
        $('#fw_form_action').attr('action', url);
        $('#fw_form_action').submit();
    }
}

function fw_add_backend_menu(cb_item_name){
    if(fw_check_have_selected_item(cb_item_name))   
    {
        var returnUrl = encodeURIComponent($(location).attr('href'));        
        var url = baseUrl + '/adminpanel/' + 'manage_module' + '/add_backend_menu' + '?returnUrl=' + returnUrl;
        $('#fw_form_action').attr('action', url);
        $('#fw_form_action').submit();
    }
}


function fw_remove_backend_menu(cb_item_name){
    if(fw_check_have_selected_item(cb_item_name))   
    {
        var returnUrl = encodeURIComponent($(location).attr('href'));        
        var url = baseUrl + '/adminpanel/' + 'manage_module' + '/remove_backend_menu' + '?returnUrl=' + returnUrl;
        $('#fw_form_action').attr('action', url);
        $('#fw_form_action').submit();
    }
}

function fw_check_have_selected_item(cb_item_name){    
    var anyBoxesChecked = false;
    $("input:checkbox[name='" + cb_item_name + "']").each(function() {
        if ($(this).is(":checked")) {
            anyBoxesChecked = true;
        }
    });    
    return anyBoxesChecked;
}

