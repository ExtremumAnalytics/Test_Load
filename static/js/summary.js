const socket = io();
var pin = localStorage.getItem('pin');
// Generate Sumaary Button
document.addEventListener('DOMContentLoaded', function() {
    const fetchSummaryBtn = document.getElementById('fetchSummaryBtn');
    const summaryList = document.getElementById('summaryList');

    fetchSummaryBtn.addEventListener('click', function() {
        $("#waitImg").show(); // Show the loading image
        const summary_que = document.getElementById('summary_que').value; // Get the value of the input field
        
        socket.emit('summary_input', { summary_que: summary_que });
    });

    socket.on('summary_response', function(data) {
        console.log(data); // Add this line to check the structure of the data
        displaySummaries(data);
        $("#waitImg").hide(); // Hide the loading image on success
        $('#message').text(data.message);
        setTimeout(function() {
            $('#message').text('');
        }, 8000); // Clear message after 8 seconds
    });

    function displaySummaries(summaries) {
        var summary = document.getElementById('summaryContainer');
        summary.innerHTML = ''; // Assuming summaryContainer is the container element

        // Check if summaries is an array
        if (Array.isArray(summaries)) {
            const list = document.createElement('ul'); // Create an unordered list element

            summaries.forEach(summary => {
                const listItem = document.createElement('li'); // Create a list item element
                // Set the HTML content of the list item with summary.key in bold style
                listItem.innerHTML = `<b>${summary.key}</b>: ${summary.value}`;
                list.appendChild(listItem); // Append the list item to the list
            });

            summary.appendChild(list); // Append the list to the container
        } else {
            // Handle the case where summaries is not an array (e.g., log an error)
            console.error('Invalid data format. Expected an array.');
        }
    }
});

// Function to clear the chat summary using Socket.IO
function clear_summ_Chat() {

    // Emit event to the server to clear chat history
    socket.emit('clear_chat_summ', {});
}

// Handle the response from the server
socket.on('clear_chat_response', function(data) {
    $('#message').text(data.message); 
    setTimeout(function() {
        $('#message').text('');
    }, 8000); // Clear message after 8 seconds

    // Clear the chat history container
    var historyContainer = document.getElementById("summaryContainer");
    historyContainer.innerHTML = "";
});

// New JavaScript function to handle LDA data received from the server
socket.on('lda_topics_summ', function(ldaData) {
    console.log('Received LDA data:', ldaData); // Add this line to debug

    let htmlString = '';
    for (const topic in ldaData) {
        if (ldaData.hasOwnProperty(topic)) {
            htmlString += `<b>${topic}:</b>`;
            const values = ldaData[topic];
            values.forEach((value, index) => {
                htmlString += (index % 2 === 0) ? `<span style="color: #0D076A">${value}</span>` : value;
                htmlString += ', ';
            });
            htmlString = htmlString.slice(0, -2); // Remove the trailing comma and space
            htmlString += '<br>';
        }
    }

    // Update the UI element based on the LDA type
    document.getElementById('ldaSummText').innerHTML = htmlString;
});