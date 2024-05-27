// $(function () {
//     const socket = io();

//     // Handle the Socket.IO events
//     socket.on('data_received', function(data) {
//         console.log(`Received data: Min Date: ${data.min_date}, Max Date: ${data.max_date}`);
//     });

//     function sendDataToFlask() {
//         var minDate = $("#minDate").val();
//         var maxDate = $("#maxDate").val();

//         // Introduce a delay of 0.5 seconds before sending data to Flask
//         setTimeout(function () {
//             // Send data to Flask using Ajax
//             $.ajax({
//                 url: "/send_data",
//                 type: "POST",
//                 contentType: "application/json",
//                 data: JSON.stringify({ minDate: minDate, maxDate: maxDate }),
//                 success: function (response) {
//                     console.log("Data sent successfully");
//                     // Emit the data_sent event to notify the server
//                     socket.emit('data_sent', {
//                         min_date: minDate,
//                         max_date: maxDate
//                     });
//                 },
//                 error: function (error) {
//                     console.error("Error sending data:", error);
//                 }
//             });
//         }, 500); // 500 milliseconds = 0.5 second
//     }

//     // Set the initial values for the date inputs and send data automatically when the page loads
//     $("#minDate, #maxDate").on("change", function() {
//         sendDataToFlask(); // Send data automatically when date inputs are changed
//     });
// });

$(function () {
    const socket = io();

    // Handle the Socket.IO events
    socket.on('data_received', function(data) {
        console.log(`Received data: Min Date: ${data.min_date}, Max Date: ${data.max_date}`);
    });

    function sendDataToSocket() {
        var minDate = $("#minDate").val();
        var maxDate = $("#maxDate").val();

        // Introduce a delay of 0.5 seconds before sending data to Socket.IO
        setTimeout(function () {
            // Emit the send_data event to notify the server
            socket.emit('send_data', {
                minDate: minDate,
                maxDate: maxDate
            });
        }, 500); // 500 milliseconds = 0.5 second
    }

    // Set the initial values for the date inputs and send data automatically when the page loads
    $("#minDate, #maxDate").on("change", function() {
        sendDataToSocket(); // Send data automatically when date inputs are changed
    });
});