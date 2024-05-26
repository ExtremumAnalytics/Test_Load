var socket=io()

document.addEventListener('DOMContentLoaded', function() {
    const fetchSummaryBtn = document.getElementById('fetchSummaryBtn');
    const summaryList = document.getElementById('summaryList');

    fetchSummaryBtn.addEventListener('click', function() {
        socket.on('summary_response', function(data) {

    });

        //$("#myDiv").html('<img src="/static/images/wait.gif" alt="Wait" />');
        $("#waitImg").show(); // Show the loading image
        const summary_que = document.getElementById('summary_que').value; // Get the value of the input field
        fetch('/summary_input', {
            method: 'POST', // Sending a POST request to the Flask route
            headers: {
                'Content-Type': 'application/json' // Set the Content-Type header
            },
            body: JSON.stringify({ summary_que: summary_que }) // Include the summary_que value in the request body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Add this line to check the structure of the data
            displaySummaries(data);
            $("#waitImg").hide(); // Hide the loading image on success
            $('#message').text(data.message);
            socket.emit('message','Summary received successfully')
            setTimeout(function() {
                $('#message').text('');
            }, 8000); // 8 seconds ke baad delete
        })
        .catch(error => {
            console.error('Error fetching summary:', error);
            $("#waitImg").hide(); // Hide the loading image on success
        });
    });

    // function displaySummaries(summaries) {
    //     summaryList.innerHTML = '';
    
    //     // Check if summaries is an array
    //     if (Array.isArray(summaries)) {
    //         summaries.forEach(summary => {
    //             const listItem = document.createElement('li');
    //             listItem.textContent = `${summary.key}: ${summary.value}`;
    //             summaryList.appendChild(listItem);
    //         });
    //     } else {
    //         // Handle the case where summaries is not an array (e.g., log an error)
    //         console.error('Invalid data format. Expected an array.');
    //     }
    // }
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



function clear_summ_Chat() {
var socket=io()
    socket.on('chat_cleared', function(data) {

    });
    // AJAX request to Flask server to clear chat history
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/clear_chat_summ", true);
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
                var historyContainer = document.getElementById("summaryContainer");
                historyContainer.innerHTML = "";
            } else {
                alert("An error occurred while clearing chat history.");
            }
        }
    };
    xhr.send(JSON.stringify({})); // Send an empty JSON object since no data is needed
}



// document.addEventListener('DOMContentLoaded', function() {
//     const fetchSummaryBtn = document.getElementById('fetchSummaryBtn');
//     const summaryList = document.getElementById('summaryList');

//     fetchSummaryBtn.addEventListener('click', function() {
//         //$("#myDiv").html('<img src="/static/images/wait.gif" alt="Wait" />');
//         $("#waitImg").show(); // Show the loading image
//         const summary_que = document.getElementById('summary_que').value; // Get the value of the input field
//         fetch('/summary_input', {
//             method: 'POST', // Sending a POST request to the Flask route
//             headers: {
//                 'Content-Type': 'application/json' // Set the Content-Type header
//             },
//             body: JSON.stringify({ summary_que: summary_que }) // Include the summary_que value in the request body
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log(data); // Add this line to check the structure of the data
//             displaySummaries(data);
//             $("#waitImg").hide(); // Hide the loading image on success
//             $('#message').text(data.message);
//             setTimeout(function() {
//                 $('#message').text('');
//             }, 8000); // 8 seconds ke baad delete
//         })
//         .catch(error => {
//             console.error('Error fetching summary:', error);
//             $("#waitImg").hide(); // Hide the loading image on success
//         });
//     });

//     // function displaySummaries(summaries) {
//     //     summaryList.innerHTML = '';
    
//     //     // Check if summaries is an array
//     //     if (Array.isArray(summaries)) {
//     //         summaries.forEach(summary => {
//     //             const listItem = document.createElement('li');
//     //             listItem.textContent = `${summary.key}: ${summary.value}`;
//     //             summaryList.appendChild(listItem);
//     //         });
//     //     } else {
//     //         // Handle the case where summaries is not an array (e.g., log an error)
//     //         console.error('Invalid data format. Expected an array.');
//     //     }
//     // }
//     function displaySummaries(summaries) {
//         var summary = document.getElementById('summaryContainer');
//         summary.innerHTML = ''; // Assuming summaryContainer is the container element
    
//         // Check if summaries is an array
//         if (Array.isArray(summaries)) {
//             const list = document.createElement('ul'); // Create an unordered list element
    
//             summaries.forEach(summary => {
//                 const listItem = document.createElement('li'); // Create a list item element
//                 // Set the HTML content of the list item with summary.key in bold style
//                 listItem.innerHTML = `<b>${summary.key}</b>: ${summary.value}`;
//                 list.appendChild(listItem); // Append the list item to the list
//             });
    
//             summary.appendChild(list); // Append the list to the container
//         } else {
//             // Handle the case where summaries is not an array (e.g., log an error)
//             console.error('Invalid data format. Expected an array.');
//         }
//     }
    
    
    
// });



// function clear_summ_Chat() {
//     // AJAX request to Flask server to clear chat history
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", "/clear_chat_summ", true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === XMLHttpRequest.DONE) {
//             if (xhr.status === 200) {
//                 var response = JSON.parse(xhr.responseText);                
//                 $('#message').text(response.message); 
//                 setTimeout(function() {
//                     $('#message').text('');
//                 }, 8000); // 8 seconds ke baad delete

//                 //alert(response.message); // Show success message
//                 // Clear the chat history container
//                 var historyContainer = document.getElementById("summaryContainer");
//                 historyContainer.innerHTML = "";
//             } else {
//                 alert("An error occurred while clearing chat history.");
//             }
//         }
//     };
//     xhr.send(JSON.stringify({})); // Send an empty JSON object since no data is needed
// }



// function getLdaData(type) {
//     fetch('/lda_data?type=' + type)
//     .then(response => response.json())
//     .then(data => {
//         document.getElementById('ldaSummText').value = JSON.stringify(data, null, 2);
//     })
//     .catch(error => console.error('Error:', error));
// }

// // Load data initially when the page loads
// getLdaData('summ');

// // Periodically check for new data every 5 seconds
// setInterval(function() {
//     getLdaData('summ');
// }, 5000);


// function getLdaData(type) {
//     fetch('/lda_data?type=' + type)
//     .then(response => response.json())
//     .then(data => {
//         console.log(data); // Print the received data to the console
//         const htmlString = Object.entries(data).map(([topic, values]) => {
//             const formattedValues = values.map((value, index) => {
//                 if (index % 2 === 0) {
//                     return `<span style="color: #0D076A">${value}</span>`;
//                 } else {
//                     return value;
//                 }
//             }).join(', ');
//             return `<b>${topic}:</b><br>${formattedValues}<br>`;
//         }).join('');
//         document.getElementById('ldaSummText').innerHTML = htmlString;
//     })
//     .catch(error => console.error('Error:', error));
// }

// // Load data initially when the page loads
// getLdaData('summ');

// // Periodically check for new data every 5 seconds
// setInterval(() => {
//     getLdaData('summ');
// }, 5000);


socket.on('lda_data_response', function(data) {
    console.log('Received LDA data:', data);  // Add this line to debug
    const ldaType = data.type;
    const ldaData = data.data;
  
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
    if (ldaType === 'Q_A') {
      document.getElementById('ldaQAText').innerHTML = htmlString;
    } else if (ldaType === 'summ') {
      document.getElementById('ldaSummText').innerHTML = htmlString;
    }
  });
  
  
  // Function to request LDA data from the server using Socket.IO
  function getLdaData(type) {
      // Emit a Socket.IO event to request LDA data
      socket.emit('request_lda_data', { type: type });
  }
  
  
  // Load data initially when the page loads
  getLdaData('summ');
  
  // Periodically check for new data every 5 seconds
  setInterval(() => {
      getLdaData('summ');
  }, 5000);