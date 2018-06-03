
function logout(){
    $.ajax({
        url: 'logout',
        method: 'post',
        success: function(result){
            if(result == 'done')
                window.location.href = '/';
        }
    })
}
