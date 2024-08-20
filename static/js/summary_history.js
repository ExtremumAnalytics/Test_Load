const displayedSummaries = new Set(); // To keep track of displayed summaries

// Remove a specific item by its key
// localStorage.removeItem('archivedSummary');
socket.emit('table_update');

document.getElementById('requestSummaryHistory').addEventListener('click', () => {
    const date = document.getElementById('summaryDate').value;
    socket.emit('request_chat_history', { date, type: 'summary' });
    alert('Sending Summary via Email');
});

function displaySummaries(summaries) {
    const summaryContainer = document.getElementById('summaryContainer');

    // Create or select the existing div element to hold the checkboxes
    let checkboxContainer = summaryContainer.querySelector('.checkbox-container');
    if (!checkboxContainer) {
        checkboxContainer = document.createElement('div');
        checkboxContainer.classList.add('checkbox-container');
        summaryContainer.appendChild(checkboxContainer);
    }

    summaries.summary_history.forEach(summary => {
        // console.log(summaries.summary_history);
        // Check if the summary has already been displayed
        const summaryKey = `${summary.filename}:${summary.summary}`;
        if (!displayedSummaries.has(summaryKey)) {
            const checkboxWrapper = document.createElement('div'); // Create a div to wrap checkbox and label
            checkboxWrapper.classList.add('checkbox-wrapper');
            checkboxWrapper.style.display = 'flex';
            checkboxWrapper.style.alignItems = 'flex-start'; // Align items vertically at the top
    
            // Create the checkbox for the summary
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('select-summary-checkbox');
            checkbox.dataset.index = summary.index;
    
            // Create the label for the summary
            const label = document.createElement('label');
            label.classList.add('summary-label');
            label.style.fontFamily = 'Times New Roman';
            label.style.fontSize = '16px';
            label.style.marginLeft = '10px'; // Add some spacing between checkbox and label
            label.style.lineHeight = '1.5'; // Line height for better alignment with checkbox
    
            // const words = `<b>${summary.key}</b>: ${summary.value.replace(/- /g, "<br>- ")}`.split(' ');
            const words = `<b>${summary.filename}</b>: ${summary.summary}`.split(' ');

            let wordIndex = 0;
    
            function typeWord() {
                if (wordIndex < words.length) {
                    label.innerHTML += words[wordIndex] + ' ';
                    wordIndex++;
                    setTimeout(typeWord, 50); // Adjust the delay as needed (50ms in this case)
                } else {
                    label.innerHTML += '<p></p>'; // Add the paragraph break after the summary
                }
            }
            typeWord(); // Start the typing effect
            // Append the checkbox and label to the checkbox wrapper
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
    
            // Append the checkbox wrapper to the container
            checkboxContainer.appendChild(checkboxWrapper);
            displayedSummaries.add(summaryKey); // Add to the set of displayed summaries
        }
    });        
}

function requestSummaryHistory() {
    document.getElementById('summarySentiments').style.display = 'none';
    document.getElementById('summaryWordCloud').style.display = 'none';
    document.getElementById('summaryTopics').style.display = 'none';

    var socket = io();
    socket.emit('table_update');
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
            // console.log(response);

            if (response.summary_history.length == 0) {
                summaryContainer.innerHTML = '<p>Sorry, No summary history found for this date.</p>';
            }
            else{
                summaryContainer.innerHTML = "";
                // Display summary history
                displaySummaries(response);
            }
            
        });
    }
}
