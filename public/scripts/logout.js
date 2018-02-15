
function logout(){
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;";
    window.location.href="/";
}
