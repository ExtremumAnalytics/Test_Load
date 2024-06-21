// JavaScript to handle Popup Modal and AJAX request
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];

var socket = io();

// Select Files to load
socket.on('updateTable', function(data) {
    var fileList = document.getElementById("fileList");

    // Clear the fileList dropdown before adding new options
    fileList.innerHTML = '';

    var filteredData = data.filter(function(file) {
        var fileExtension = file.name.split('.').pop().toLowerCase();
        return fileExtension === 'xlsx' || fileExtension === 'csv';
    });

    filteredData.forEach(function(file) {
        var option = document.createElement("option");
        option.text = file.name;
        option.value = file.url;
        fileList.appendChild(option);
    });
});

function table_data_retrieve() {
    modal.style.display = "block";
    $.ajax({
        url: '/table_update',
        type: 'GET',
        success: function(data) {
        }
    });
}

// Close the modal if close button is clicked
span.onclick = function() {
  modal.style.display = "none";
}

// Close the modal if user clicks outside the modal
window.onclick = function(event) {
  var modal = document.getElementById('myModal');
  if (event.target == modal) {
    closeModal();
  }
}

// Close the select menu
function closeModal() {
  document.getElementById('myModal').style.display = 'none';
}


// Function to load data from the selected file
function loadData() {
  var selectedFileUrl = document.getElementById("fileList").value;

  // Clear the message after 8 seconds
  setTimeout(function() {
      document.getElementById('message').textContent = '';
  }, 8000);

  // Emit the eda_process event with the selected file URL
  socket.emit('eda_process', { fileUrl: selectedFileUrl });

  // Handle the response from the server
  socket.on('eda_response', function(response) {
      if (response.success) {
          // Handle success response
          closeModal();
      }
      document.getElementById('message').textContent = response.message;
  });
}

// Function to clear the chat content
function clearChat() {
  document.getElementById('eda_questionAnswer').innerHTML = '';
  $('#message').text(data.message);
  setTimeout(function() {
    $('#message').text('');
  }, 8000); // Delete after 8 seconds
}

// Send User Question to backend
function sendQuestion() {
  const question = document.getElementById('question_eda').value;
  $("#waitImg").show(); // Show the loading image

  // Emit the 'eda_process' event with the question data
  socket.emit('eda_process', { question });

  // Listen for the 'eda_response' event to handle the server response
  socket.on('eda_response', (data) => {
      $("#waitImg").hide(); // Hide the loading image on success
      $('#message').text(data.message);
      setTimeout(function() {
        $('#message').text('');
      }, 8000); //delete after 8 seconds

      // Parse JSON string to array if it's a string
      if (typeof data.output_any === 'string') {
          data.output_any = JSON.parse(data.output_any);
      }

      // Initialize the content to be displayed
      let displayContent = '';

      // Check the type of output and create appropriate content
      switch(data.output_type) {
          case 'table':
              // Assuming data is an array of objects
              if (Array.isArray(data.output_any)) {
                  let tableHTML = '<table style="border-collapse: collapse;"><thead><tr>';
                  Object.keys(data.output_any[0]).forEach(key => {
                      tableHTML += `<th style="border: 1px solid black; padding: 8px;">${key}</th>`;
                  });
                  tableHTML += '</tr></thead><tbody>';
                  data.output_any.forEach(row => {
                      tableHTML += '<tr>';
                      Object.values(row).forEach(value => {
                          tableHTML += `<td style="border: 1px solid black; padding: 8px;">${value}</td>`;
                      });
                      tableHTML += '</tr>';
                  });
                  tableHTML += '</tbody></table>';
                  displayContent = tableHTML;
              } else {
                  // Handle invalid table data
                  displayContent = 'Invalid table data';
              }
              break;
          case 'numeric':
          case 'text':
              // Directly display numeric and text data
              displayContent = data.output_any;
              break;
          default:
              // Handle unknown type
              displayContent = 'Unknown response type';
      }

      // Check if there's an image and add it to the content
      if (data.image) {
          const imageUrl = `data:image/png;base64,${data.image}`;
          displayContent += `<div><img src="${imageUrl}" alt="Processed Image" style="max-width: 100%; height: auto;" /></div>`;
      }

      // Display the final content
      document.getElementById('eda_questionAnswer').innerHTML = displayContent;
  });

  // Handle errors
  socket.on('connect_error', (error) => {
      console.error('Connection Error:', error);
      $("#waitImg").hide();
      document.getElementById('eda_questionAnswer').textContent = 'Failed to send question';
  });
}