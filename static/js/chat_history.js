document.addEventListener('DOMContentLoaded', (event) => {
    var socket = io();

    socket.on('connect', function() {
        console.log('Connected to the server');
    });

    // Listen for the chat_history event
    socket.on('chat_history', function(response) {
        // console.log(response);
        // Display chat history
        var historyContainer = document.getElementById("questionAnswer");
        historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

        var historyList = document.getElementById("chatHistoryList");
        response.chat_history.forEach(function(item) {
            var listItem = document.createElement('li');
            var question = "<b>" + "Question: " + "</b>" + item.question;
            var answer = "<b>" + "Answer: \n" + "</b>" + item.answer;
            var sourceLink = "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong> Source </strong></a>";

            var content = question + "\n" + answer + "\n" + sourceLink + "\n\n";

            var preElement = document.createElement('pre');
            preElement.innerHTML = content;
            preElement.classList.add('formatted-pre');
            // Set the CSS properties to handle overflow
            preElement.style.whiteSpace = 'pre-wrap'; // Allows text to wrap
            preElement.style.overflowX = 'hidden';    // Hides horizontal overflow
            preElement.style.overflowY = 'auto';      // Allows vertical overflow (optional)
            preElement.style.fontFamily = 'TimesNew Roman';
            preElement.style.fontSize ='16px';
            listItem.appendChild(preElement);
            historyList.appendChild(listItem);
        });

        // Attach event listeners to source links
        document.querySelectorAll('.source-link').forEach(function(link) {
            link.addEventListener('click', function() {
                openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
            });
        });
    });
});


function requestChatHistory() {
    document.getElementById('askSentiments').style.display = 'none';
    document.getElementById('askTopics').style.display = 'none';

    var socket = io();
    const date = document.getElementById('chatDate').value;
    // console.log(date);
    // Emit an event to request chat history
    if (!date) {
        // No date selected, request all chat history
        socket.emit('request_chat_history', { date: null });
        alert('Please select any date!')
    } else {
        // Date is selected, request filtered chat history
        socket.emit('request_chat_history', { date: date });
        document.getElementById("questionAnswer").innerHTML = "";

        // Listen for the chat_history event
        socket.on('chat_history', function(response) {
            
            // console.log(response);
            // Display chat history
            var historyContainer = document.getElementById("questionAnswer");
            historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";
            if (response.chat_history.length == 0) {
                historyContainer.innerHTML = '<p>Sorry, No chat history found for this date.</p>';
            }
            var historyList = document.getElementById("chatHistoryList");
            response.chat_history.forEach(function(item) {
                var listItem = document.createElement('li');
                var question = "<b>" + "Question: " + "</b>" + item.question;
                var answer = "<b>" + "Answer: \n" + "</b>" + item.answer;
                var sourceLink = "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong> Source </strong></a>";

                var content = question + "\n" + answer + "\n" + sourceLink + "\n\n";

                var preElement = document.createElement('pre');
                preElement.innerHTML = content;
                preElement.classList.add('formatted-pre');
                // Set the CSS properties to handle overflow
                preElement.style.whiteSpace = 'pre-wrap'; // Allows text to wrap
                preElement.style.overflowX = 'hidden';    // Hides horizontal overflow
                preElement.style.overflowY = 'auto';      // Allows vertical overflow (optional)
                preElement.style.fontFamily = 'TimesNew Roman';
                preElement.style.fontSize ='16px';
                listItem.appendChild(preElement);
                historyList.appendChild(listItem);
            });

            // Attach event listeners to source links
            document.querySelectorAll('.source-link').forEach(function(link) {
                link.addEventListener('click', function() {
                    openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
                });
            });
        });
    }
}
