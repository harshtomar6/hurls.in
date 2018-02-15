$(document).ready(function(){
    var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

    $('#msg').hide()
    $('#msg1').hide()
    $('.main').css('min-height', (height*0.85))
    $('.navbar-toggle').click(function(){
        $('#navbar').css({'background-color': 'rgba(0, 0, 0, 0.8)', 'color': '#FEF600'})
    })

    //Login validation
    $('#login-form').submit(function(event){
        var email = $("#login-form input[name = 'email']").val()
        var password = $("#login-form input[name = 'password']").val()

        $.ajax({
            url: '/login',
            method: 'post',
            data: {'email': email, 'password': password},
            success: function(result){
                result = JSON.parse(result)
                console.log(result.success)
                if(isEmpty(result.success)){
                    $('#msg').fadeOut(400, function(){
                        $('#msg strong').text(result.error)
                    })
                    $('#msg').fadeIn(400)
                }else{
                    var now = new Date();
                    now.setMonth(now.getMonth()+1)
                    document.cookie = "user="+JSON.stringify(result.success)+';'+"expires="+now.toUTCString();
                    window.location.href = '/'
                    //console.log(result.success)
                }
            }
        })
        event.preventDefault()
    })


    //Signup validation
    $('#signup-form').submit(function(event){
        var firstname = $("#signup-form input[name='firstName']").val()
        var lastname = $("#signup-form input[name='lastName']").val()
        var email = $("#signup-form input[name='email']").val()
        var password = $("#signup-form input[name='password']").val()
        var repeatPassword = $("#signup-form input[name='repeatPassword']").val()

        if(password == repeatPassword){
            $.ajax({
                url: '/signup',
                method: 'post',
                data: {'firstName': firstname, 'lastName': lastname, 'email': email, 'password': password},
                success: function(result){
                    console.log(result)
                    $('#msg1').fadeOut(400, function(){
                        $('#msg1 strong').text(result)
                    })
                    $('#msg1').fadeIn(400)
                }
            })
            //return
        }
        else{
            $('#msg1').fadeOut(400)
            $('#msg1').fadeIn(400)
            console.log('Password do not match')
        }

        event.preventDefault()
    })
})

function isEmpty(obj){
    for(var p in obj){
        if(obj.hasOwnProperty(p))
            return false
    }

    return true
}

function typetext(text, location, callBack){
   var arr = text.split("");
   var i=0, text;
   $(location).text("");
   var time = setInterval(function(){
       if(i >= arr.length){
           clearInterval(time);
           callBack();
           $(location).html(text[0]+arr[arr.length-1]+'<span class="blink">|</span>');
           blink();
       }else{
           text = $(location).text().split("|");
           $(location).text(text[0]+arr[i]+"|");
           i++;
       }
   }, 150);
}

function clearText(location, callback){
    var arr = $(location).text()
    var i=0, text;

    var t = setInterval(function(){
        if(i >= arr.length){
            clearInterval(t)
            callback()
            blink()
        }else{
            text = arr.split("|");
            var updatedText = text[0].substr(0, text[0].length-i)+"|"
            $(location).text(updatedText)
            i++;
        }
    }, 150)
}

function blink(){
   $('.blink').animate({
       'opacity': '0'
   }, 300, function(){
       $(this).animate({
           'opacity': '1'
       }, 300, blink());
   });
}
