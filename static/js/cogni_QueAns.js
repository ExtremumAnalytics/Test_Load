function openFileInNewTab(url) {
    var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
    var win = window.open(googleDocsUrl, '_blank');
    win.focus();
}

function sendQuestion() {
    var question = document.getElementById("question").value.trim(); // Trim the question

    if (question === "") {
        alert("Ask Question!");
        return;
    }
    $("#waitImg").show(); // Show the loading image
    // AJAX request to Flask server
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/ask", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                $("#waitImg").hide(); // Hide the loading image on success
                $('#message').text(response.message); 
                setTimeout(function() {
                    $('#message').text('');
                }, 8000); // 8 seconds ke baad delete
                // // Display question and answer
                // var qaContainer = document.getElementById("questionAnswer");
                // qaContainer.innerHTML = "<div><strong>Question:</strong> " + response.answer[0].question + "</div>" +
                //                          "<div><strong>Answer:</strong> " + response.answer[0].answer + "</div>" +
                //                          "<div><strong>Source:</strong> " + response.answer[0].source + "</div>" +
                //                          "<div><strong>Page Number:</strong> " + response.answer[0].page_number + "</div>";

                // Display chat history
                var historyContainer = document.getElementById("questionAnswer");
                historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

                var historyList = document.getElementById("chatHistoryList");
                response.chat_history.forEach(function(item) {
                    historyList.innerHTML += "<li><strong>Question:</strong> " + item.question + "<br>" +
                    "<strong>Answer:</strong> " + item.answer + "<br>" +
                    "<strong>Source:</strong> <a href='#' onclick=\"openFileInNewTab('" + item.source + "')\" target='_blank'>" + item.source + "</a><br>" +
                    "<strong>Page Number:</strong> " + item.page_number + "</li><br>";
                });
                

                document.getElementById("question").value = ""; // Clear the question input
            } else {
                alert("An error occurred while processing your request.");
                $("#waitImg").hide(); // Hide the loading image on success
            }
        }
    };
    xhr.send(JSON.stringify({question: question}));
}


function clearChat() {
    // AJAX request to Flask server to clear chat history
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/clear_chat", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);                
                $('#message').text(response.message); 
                setTimeout(function() {
                    $('#message').text('');
                }, 8000); // 8 seconds ke baad delete

                //alert(response.message); // Show success message
                // Clear the chat history container
                var historyContainer = document.getElementById("questionAnswer");
                historyContainer.innerHTML = "";
            } else {
                alert("An error occurred while clearing chat history.");
            }
        }
    };
    xhr.send(JSON.stringify({})); // Send an empty JSON object since no data is needed
}


// function updateCharts() {
//     fetch('/graph_update')
//     .then(response => response.json())
//     .then(data => {
        
//         // Update Gauge Q/A (if any)
//         var qaChartJSON = JSON.parse(data.gauge_Q_A);
//         var sentiChartJSON = JSON.parse(data.senti_Q_A);
//         Plotly.react('gauge-qa', qaChartJSON.data, qaChartJSON.layout);
//         // Plotly.react('sentiment_chart', sentiChartJSON.data, sentiChartJSON.layout);
//     });
// }

// // Update charts every 10 seconds (adjust as needed)
// setInterval(updateCharts, 2000);

// // Initial update
// updateCharts();



// function getLdaData(type) {
//     fetch('/lda_data?type=' + type)
//     .then(response => response.json())
//     .then(data => {
//         document.getElementById('ldaQAText').value = JSON.stringify(data, null, 2);
//     })
//     .catch(error => console.error('Error:', error));
// }

// // Load data initially when the page loads
// getLdaData('Q_A');

// // Periodically check for new data every 5 seconds
// setInterval(function() {
//     getLdaData('Q_A');
// }, 5000);



function getLdaData(type) {
    fetch('/lda_data?type=' + type)
    .then(response => response.json())
    .then(data => {
        let htmlString = '';
        for (const topic in data) {
            if (data.hasOwnProperty(topic)) {
                htmlString += `<b>${topic}:</b>`;
                const values = data[topic];
                values.forEach((value, index) => {
                    htmlString += (index % 2 === 0) ? `<span style="color: #0D076A">${value}</span>` : value;
                    htmlString += ', ';
                });
                htmlString = htmlString.slice(0, -2); // Remove the trailing comma and space
                htmlString += '<br>';
            }
        }
        document.getElementById('ldaQAText').innerHTML = htmlString;
    })
    .catch(error => console.error('Error:', error));
}

// Load data initially when the page loads
getLdaData('Q_A');

// Periodically check for new data every 5 seconds
setInterval(() => {
    getLdaData('Q_A');
}, 5000);