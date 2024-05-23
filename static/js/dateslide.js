// $(function () {
//     const socket = io();

//     // Handle the Socket.IO events
//     socket.on('data_received', function(data) {
//         alert(data.message);
//         console.log(`Received data: Min Date: ${data.min_date}, Max Date: ${data.max_date}`);
//     });

//     function sendDataToFlask() {
//         var minDate = $("#minDate").datepicker("getDate").toISOString().split('T')[0];
//         var maxDate = $("#maxDate").datepicker("getDate").toISOString().split('T')[0];

//         // Introduce a delay of 1 second before sending data to Flask
//         setTimeout(function () {
//             // Send data to Flask using Ajax
//             $.ajax({
//                 url: "/send_data",
//                 type: "POST",
//                 contentType: "application/json",
//                 data: JSON.stringify({ minDate: minDate, maxDate: maxDate }),
//                 success: function (response) {
//                     console.log("Data sent successfully");
//                     // Emit the data_received event to notify the server
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

//     // Initialize the datepicker for min date
//     $("#minDate").datepicker({
//         dateFormat: "yy-mm-dd",
//         onSelect: function (dateText) {
//             $("#dateSlider").slider("values", 0, new Date(dateText));
//             sendDataToFlask(); // Send data automatically when min date is selected
//         }
//     });

//     // Initialize the datepicker for max date
//     $("#maxDate").datepicker({
//         dateFormat: "yy-mm-dd",
//         onSelect: function (dateText) {
//             $("#dateSlider").slider("values", 1, new Date(dateText));
//             sendDataToFlask(); // Send data automatically when max date is selected
//         }
//     });

//     // Initialize the slider
//     $("#dateSlider").slider({
//         range: true,
//         min: new Date("2023-01-01").getTime(),
//         max: new Date().getTime(), // Set max to today's date
//         step: 1,
//         values: [new Date("2022-01-01").getTime(), new Date().getTime()], // Initial range
//         slide: function (event, ui) {
//             // Update the datepicker inputs when the slider is moved
//             $("#minDate").datepicker("setDate", new Date(ui.values[0]));
//             $("#maxDate").datepicker("setDate", new Date(ui.values[1]));
//             sendDataToFlask(); // Send data automatically when slider is moved
//         }
//     });

//     // Set the initial values for the datepicker inputs
//     $("#minDate").datepicker("setDate", new Date($("#dateSlider").slider("values", 0)));
//     $("#maxDate").datepicker("setDate", new Date($("#dateSlider").slider("values", 1)));

//     // Send data automatically when the page loads
//     sendDataToFlask();
// });


$(function () {
    const socket = io();

    // Handle the Socket.IO events
    socket.on('data_received', function(data) {
        console.log(`Received data: Min Date: ${data.min_date}, Max Date: ${data.max_date}`);
    });

    function sendDataToFlask() {
        var minDate = $("#minDate").val();
        var maxDate = $("#maxDate").val();

        // Introduce a delay of 0.5 seconds before sending data to Flask
        setTimeout(function () {
            // Send data to Flask using Ajax
            $.ajax({
                url: "/send_data",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ minDate: minDate, maxDate: maxDate }),
                success: function (response) {
                    console.log("Data sent successfully");
                    // Emit the data_sent event to notify the server
                    socket.emit('data_sent', {
                        min_date: minDate,
                        max_date: maxDate
                    });
                },
                error: function (error) {
                    console.error("Error sending data:", error);
                }
            });
        }, 500); // 500 milliseconds = 0.5 second
    }

    // Set the initial values for the date inputs and send data automatically when the page loads
    $("#minDate, #maxDate").on("change", function() {
        sendDataToFlask(); // Send data automatically when date inputs are changed
    });
});

