const displayedSummaries = new Set(); // To keep track of displayed summaries
function displaySummaries(summaries) {
    const summaryContainer = document.getElementById('summaryContainer');

    // Create or select the existing unordered list element
    let list = summaryContainer.querySelector('ul');
    if (!list) {
        list = document.createElement('ul');
        summaryContainer.appendChild(list);
    }

    summaries.summary_history.forEach(summary => {
        // Check if the summary has already been displayed
        const summaryKey = `${summary.filename}:${summary.summary}`;
        if (!displayedSummaries.has(summaryKey)) {
            const listItem = document.createElement('li'); // Create a list item element
            list.appendChild(listItem); // Append the list item to the list

            const words = `<b>${summary.filename}</b>: ${summary.summary}`.split(' ');
            let wordIndex = 0;

            function typeWord() {
                if (wordIndex < words.length) {
                    listItem.innerHTML += words[wordIndex] + ' ';
                    wordIndex++;
                    setTimeout(typeWord, 50); // Adjust the delay as needed (50ms in this case)
                } else {
                    listItem.innerHTML += '<p></p>'; // Add the paragraph break after the summary
                }
            }
            typeWord(); // Start the typing effect
            displayedSummaries.add(summaryKey); // Add to the set of displayed summaries
        }
    });
}


function requestSummaryHistory() {
    document.getElementById('summarySentiments').style.display = 'none';
    document.getElementById('summaryWordCloud').style.display = 'none';
    document.getElementById('summaryTopics').style.display = 'none';

    var socket = io();
    const date = document.getElementById('summaryDate').value;
    // console.log(date);
    // Emit an event to request chat history
    if (!date) {
        // No date selected, request all chat history
        socket.emit('request_chat_history', { date: null });
        alert('Please select any date!')
    } else {
        // Date is selected, request filtered chat history
        socket.emit('request_chat_history', { date: date });
        // Listen for the chat_history event
        socket.on('summary_history', function(response) {
            if (response.summary_history.length == 0) {
                summaryContainer.innerHTML = '<p>Sorry, No summary history found for this date.</p>';
            }
            // console.log(response);
            else{
                summaryContainer.innerHTML = "";
                // Display summary history
                displaySummaries(response);
            }
            
        });
    }
}
