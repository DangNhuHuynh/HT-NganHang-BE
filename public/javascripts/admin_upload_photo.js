//Yêu cầu phải có 1 div tên fw_upload_cropjs
function upload_photo_with_crop_js(id_element_upload, field_name, thumb_w, thumb_h, large_w, large_h, ratio, is_delete = false){
   
    //init field    
    $(document).ready(function(){
        //Vào kiểm tra load lại hình hiện tại
        var currentImage = $('input[name=' + field_name + ']').val();
  
        if(currentImage != undefined && checkImageUrl(currentImage) && is_delete == false){            
          
            var html = '<input type="hidden" id="uploadImageControl' + id_element_upload + '" name="' + field_name  + '" value="' + currentImage + '" /><img id="imgThumbnail" src="' + baseUrl + '/medias/photos/' + currentImage + '" width="200" style="margin-top:10px;" />&nbsp;<span onclick=\'DeleteImageByCropJS("' + id_element_upload + '", "' + field_name + '", "' + thumb_w +'", "' + thumb_h +'", "' + large_w +'", "' + large_h + '", "' + ratio +'");\' class="fa fa-trash" style="cursor:pointer;" ></span>';
            $('#' + id_element_upload).html(html);  
        }
        else{
    

            //Xử lý add function upload
            var html = '<input type="file" id="uploadImageControl' + id_element_upload + '" name="' + field_name  + '" /><img id="imgThumbnail" src="' + baseUrl + '/public/images/blank.gif" width="70" style="margin-top:10px;" />'
            $('#' + id_element_upload).html(html);                
            
            function handleFileSelect(evt) {
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    var files = evt.target.files;
                    var file = files[0];
                    if ((file.type == 'image/jpg' || file.type == 'image/png' || file.type == 'image/jpeg') && file.size < 4194309) {
                        var call_action_upload_photo = baseUrl + '/adminpanel/base/upload-photo-binary?type=' +  encodeURI(file.type) + '&thumb_w=' + thumb_w + '&thumb_h=' + thumb_h + '&large_w=' + large_w + '&large_h=' + large_h;
                        
                        var fReader = new FileReader();
                        fReader.onload = function (f) {
                            try {
                                var data = f.target.result;                              
                                setTimeout(UploadImageByCropperJS(id_element_upload, field_name, call_action_upload_photo, data, thumb_w, thumb_h, large_w, large_h, ratio), 3000);
                            }
                            catch (err) {
                                //alert('Hiện ứng dụng chưa hỗ trợ hình ảnh sử dụng công nghệ Lightning.');
                                alert(err);
                            }
                        }
                        fReader.readAsDataURL(file);
                    }
                    else {
                        alert('Only allow .jpg, .jpeg, .png. Size < 4MB.')
                    }
                }
                else {
                    alert('Your browser not support this feature. Please try with Safari, Chrome hoặc Firefox.');
                }
            }
            document.getElementById('uploadImageControl' + id_element_upload).addEventListener('change', handleFileSelect, false);
        }
    });
    
}

function UploadImageByCropperJS(id_element_upload, field_name, action_upload, data, thumb_w, thumb_h, large_w, large_h, ratio) 
{
    
    $('#btnCropImage').prop('disabled', false);
    $('#modal-cropjs-dialog').width(parseInt(large_w) + 30);
    $('#modal-cropjs-content').width(parseInt(large_w) + 30);
    $('#uploadPhotoCropperImg').html('<img src="' + data + '" id="cropperJSImage" width="' + large_w + '" />');
    $('#uploadPhotoUsingCropperJSModal').modal();

    $('#cropperJSImage').cropper({
        aspectRatio: ratio,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: false,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        minContainerHeight: large_h,
		minContainerWidth: large_w
    });
    
    //$('#btnCropImage').click();
    function CropClick () {
        $('#btnCropImage').prop('disabled', true);
        var cropcanvas = $('#cropperJSImage').cropper('getCroppedCanvas');
        var dataImage = cropcanvas.toDataURL("image/png");
        $.ajax({
            type: 'POST',
            url: action_upload,
            data: {
                qqfile : dataImage,
                '_csrf' : reload_csrf_token()
            },
            dataType: 'json',
            success: function (responseJSON) {
                if(responseJSON.result == true){
                    $('#uploadPhotoUsingCropperJSModal').modal('hide');
                    var html = '<input type="hidden" id="uploadImageControl' + id_element_upload+ '" name="' + field_name  + '" value="' + responseJSON.data + '" /><img id="imgThumbnail" src="' + baseUrl + responseJSON.image + '" width="200" style="margin-top:10px;" />&nbsp;<span onclick=\'DeleteImageByCropJS("' + id_element_upload + '", "' + field_name + '", "' + thumb_w +'", "' + thumb_h +'", "' + large_w +'", "' + large_h + '", "' + ratio +'");\' class="fa fa-trash" style="cursor:pointer;" ></span>';
                    $('#' + id_element_upload).html(html); 
                    
                    function handleFileSelect2(evt) {
                        if (window.File && window.FileReader && window.FileList && window.Blob) {
                            var files = evt.target.files;
                            var file = files[0];
                            if ((file.type == 'image/jpg' || file.type == 'image/png' || file.type == 'image/jpeg') && file.size < 4194309) {
                                var call_action_upload_photo = baseUrl + '/adminpanel/base/upload-photo-binary?type=' +  encodeURI(file.type) + '&thumb_w=' + thumb_w + '&thumb_h=' + thumb_h + '&large_w=' + large_w + '&large_h=' + large_h;
                                
                                var fReader = new FileReader();
                                fReader.onload = function (f) {
                                    try {
                                        var data = f.target.result;
                                        setTimeout(UploadImageByCropperJS(id_element_upload, field_name, call_action_upload_photo, data, thumb_w, thumb_h, large_w, large_h, ratio), 2000);
                                    }
                                    catch (err) {
                                        //alert('Hiện ứng dụng chưa hỗ trợ hình ảnh sử dụng công nghệ Lightning.');
                                        alert(err);
                                    }
                                }
                                fReader.readAsDataURL(file);
                            }
                            else {
                                alert('Only allow .jpg, .jpeg, .png. Size < 4MB.')
                            }
                        }
                        else {
                            alert('Your browser not support this feature. Please try with Safari, Chrome hoặc Firefox.');
                        }
                    }
                    
                    document.getElementById('uploadImageControl' + id_element_upload).removeEventListener('change', handleFileSelect2, false);
                }
            }
        })
    };     
    $( "#btnCropImage" ).off('click');
    $( "#btnCropImage" ).bind( "click", CropClick );  
}

function DeleteImageByCropJS(id_element_upload, field_name, thumb_w, thumb_h, large_w, large_h, ratio){
    upload_photo_with_crop_js(id_element_upload, field_name, thumb_w, thumb_h, large_w, large_h, ratio, true);
}
