document.addEventListener('DOMContentLoaded', (event) => {
    var socket = io();

    socket.on('connect', function() {
        console.log('Connected to the server');
    });

    document.getElementById('requestChatHistory').addEventListener('click', () => {
        const date = document.getElementById('chatDate').value;
        socket.emit('request_chat_history', { date, type: 'chat' });
        alert('Sending Chat via Email');
    });

    // Listen for the chat_history event
    socket.on('chat_history', function(response) {
        // Display chat history
        
        response.chat_history.forEach(function(item) {
            // Create the list item element
            var listItem = document.createElement('div');
            listItem.classList.add('chat-item'); // Optional: add a class for styling
    
            // Create the checkbox for selecting the chat
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('select-chat-checkbox');
            checkbox.dataset.index = item.index;
    
            // Create the question element
            var questionElement = document.createElement('span');
            questionElement.innerHTML = "<b> Question: </b>" + item.question;
    
            // Combine checkbox and question in a single container
            var questionContainer = document.createElement('label'); // Use label for better accessibility
            questionContainer.appendChild(checkbox);
            questionContainer.appendChild(questionElement);
            questionContainer.style.fontFamily = 'Times New Roman';
            questionContainer.style.fontSize = '16px';
    
            // Create the answer and source link content
            var preElement = document.createElement('pre');
            preElement.innerHTML = "<b>Answer:</b> " + item.answer + "\n" +
                                   "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong> Source </strong></a>\n\n";
            preElement.classList.add('formatted-pre');
            
            // Set the CSS properties to handle overflow
            preElement.style.whiteSpace = 'pre-wrap';
            preElement.style.overflowX = 'hidden';
            preElement.style.overflowY = 'auto';
            preElement.style.fontFamily = 'Times New Roman';
            preElement.style.fontSize = '16px';
    
            // Append the question container and answer to the list item
            listItem.appendChild(questionContainer);
            listItem.appendChild(preElement);
    
            // Append the list item to the chat history list (assumed to be a div)
            document.getElementById('questionAnswer').appendChild(listItem); // Assume there's a div with this ID
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
