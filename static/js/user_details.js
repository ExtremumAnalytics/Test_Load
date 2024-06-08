// var socket = io();
var pin = localStorage.getItem('pin');
const socket_user = io();
socket_user.on('userName', function(data) {
    if(data.pin==pin){
        document.getElementById('userName').innerHTML = `${data.userName}`;
    } 
});