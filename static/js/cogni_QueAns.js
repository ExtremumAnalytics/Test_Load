// Open the Source URL from Results 
function openFileInNewTab(url) {
    var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
    var win = window.open(googleDocsUrl, '_blank');
    win.focus();
}

// Progress Bar update
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('waitImg');
    progressBar.style.width = percentage + '%';
    percent=percentage + '%';
    progressBar.setAttribute('width', percent);
    progressBar.innerText = percentage + '% ';
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
    
    socket.on('progress', function(data) {
        if(data.pin==pin){
            updateProgressBar(data.percentage);
            console.log(data.percentage)
        }
    });
    
    socket.on('response', function(response) {
        updateProgressBar(100);
        console.log('100')
        setTimeout(() => {
            document.getElementById("waitImg").style.display = 'none';
        }, 1500);
        
        if (response.message) {
            document.getElementById('message').innerText = response.message;
            setTimeout(function() {
                document.getElementById('message').innerText = '';
            }, 8000); // delete after 8 seconds
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

// Clear Chat
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
            var doc = document.getElementById('draftIframe');
            historyContainer.innerHTML = "";
            doc.src = "";
        } else {
            alert("An error occurred while clearing chat history.");
        }
    });
}

const socket=io();
var pin = localStorage.getItem('pin');

socket.on('lda_topics_QA', function(data) {
    // Only update the UI if the data is for the current user
    if (data.pin === pin) {
        console.log('Received LDA keywords:', data); // Debug

        // let htmlString = '';
        if (Array.isArray(data.keywords)) {
            let htmlString = data.keywords.map(keyword => `<span style="color: #0D076A">${keyword}</span>`).join(', ');
            document.getElementById('ldaQAText').innerHTML = htmlString;
        } else {
            console.error('Expected an array of keywords, but received:', data.keywords);
        }

        // Update the UI element based on the LDA type
        // document.getElementById('ldaQAText').innerHTML = htmlString;
    }
});

// // Q/A Page Topics Defining using Latent Dirichlet Allocation
// socket.on('lda_topics_QA', function(data) {
//     // Only update the LDA topics if the data is for the current user
//     if (data.pin === pin) {
//         console.log('Received LDA data:', data); // Debug

//         let htmlString = '';
//         for (const topic in data) {
//             if (data.hasOwnProperty(topic)) {
//                 htmlString += `<b>${topic}:</b>`;

//                 const values = data[topic];
//                 console.log(`Topic: ${topic}, Values:`, values); // Debug: Log the values

//                 // Check if values is an array
//                 if (Array.isArray(values)) {
//                     values.forEach((value, index) => {
//                         htmlString += (index % 2 === 0) ? `<span style="color: #0D076A">${value}</span>` : value;
//                         htmlString += ', ';
//                     });
//                 } else {
//                     console.error(`Expected an array for topic ${topic}, but got:`, values);
//                 }

//                 htmlString = htmlString.slice(0, -2); // Remove the trailing comma and space
//                 htmlString += '<br>';
//             }
//         }

//         // Update the UI element based on the LDA type
//         document.getElementById('ldaQAText').innerHTML = htmlString;
//     }
// });