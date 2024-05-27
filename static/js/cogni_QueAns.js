function openFileInNewTab(url) {
    var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
    var win = window.open(googleDocsUrl, '_blank');
    win.focus();
}


// Define the sendQuestion function in the global scope
function sendQuestion() {
    const socket=io();
    var question = document.getElementById("question").value.trim(); // Trim the question

    if (question === "") {
        alert("Ask Question!");
        return;
    }
    document.getElementById("waitImg").style.display = 'block'; // Show the loading image

    socket.emit('ask_question', { question: question });

    socket.on('response', function(response) {
        document.getElementById("waitImg").style.display = 'none'; // Hide the loading image on success

        if (response.message) {
            document.getElementById('message').innerText = response.message;
            setTimeout(function() {
                document.getElementById('message').innerText = '';
            }, 8000); // 8 seconds ke baad delete
        }

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
    });
}


function clearChat() {
    const socket=io();
    socket.emit('clear_chat');

    socket.on('chat_cleared', function(data) {
        console.log('response', data);
        $('#message').text(data.message);
        setTimeout(function() {
            $('#message').text('');
        }, 8000); // Clear the message after 8 seconds

        if (data.message === 'Chat history cleared successfully') {
            var historyContainer = document.getElementById("questionAnswer");
            historyContainer.innerHTML = "";
        } else {
            alert("An error occurred while clearing chat history.");
        }
    });
}



const socket=io();
socket.on('lda_topics_QA', function(ldaData) {
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
    document.getElementById('ldaQAText').innerHTML = htmlString;
});
