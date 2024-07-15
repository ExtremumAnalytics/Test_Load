var pin = localStorage.getItem('pin');

socket.on('userName', function(data) {
    if(data.pin==pin){
        document.getElementById('userName').innerHTML = `${data.userName}`;
    } 
});