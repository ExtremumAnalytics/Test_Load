// Initially hide the modal
// document.getElementById('myModal').style.display = 'none';
// JavaScript to handle Popup Modal and AJAX request
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];


function table_data_retrieve() {
    modal.style.display = "block";
    $.ajax({
      url: '/table_update',
      type: 'GET',
      success: function(data) {
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


function closeModal() {
  document.getElementById('myModal').style.display = 'none';
}


// Load data from selected file
function loadData() {
  var selectedFileUrl = document.getElementById("fileList").value;
  // $('#message').text(data.message);
  setTimeout(function() {
    $('#message').text('');
  }, 8000); // 8 seconds ke baad delete
  $.ajax({
    url: '/Eda_Process',
    type: 'POST',
    data: JSON.stringify({ fileUrl: selectedFileUrl }),
    contentType: 'application/json',
    success: function(response) {
      // Handle success response, if needed
      closeModal()
      $('#message').text(response.message);
    }
  });
}

// Function to clear the chat content
function clearChat() {
  document.getElementById('eda_questionAnswer').innerHTML = '';
  $('#message').text(data.message);
  setTimeout(function() {
    $('#message').text('');
  }, 8000); // 8 seconds ke baad delete
}



// function sendQuestion() {
//     const question = document.getElementById('question_eda').value;
//     fetch('/Eda_Process', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ question })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         // Parse JSON string to array if it's a string
//         if (typeof data.output_any === 'string') {
//             data.output_any = JSON.parse(data.output_any);
//         }

//         // Check the type of output and display accordingly
//         switch(data.output_type) {
//             case 'table':
//                 // Assuming data is an array of objects
//                 if (Array.isArray(data.output_any)) {
//                     let tableHTML = '<table><thead><tr>';
//                     Object.keys(data.output_any[0]).forEach(key => {
//                         tableHTML += `<th>${key}</th>`;
//                     });
//                     tableHTML += '</tr></thead><tbody>';
//                     data.output_any.forEach(row => {
//                         tableHTML += '<tr>';
//                         Object.values(row).forEach(value => {
//                             tableHTML += `<td>${value}</td>`;
//                         });
//                         tableHTML += '</tr>';
//                     });
//                     tableHTML += '</tbody></table>';
//                     document.getElementById('eda_questionAnswer').innerHTML = tableHTML;
//                 } else {
//                     // Handle invalid table data
//                     document.getElementById('eda_questionAnswer').textContent = 'Invalid table data';
//                 }
//                 break;
//             case 'numeric':
//             case 'text':
//                 // Directly display numeric and text data
//                 document.getElementById('eda_questionAnswer').textContent = data.output_any;
//                 break;
//             default:
//                 // Handle unknown type
//                 document.getElementById('eda_questionAnswer').textContent = 'Unknown data type';
//         }
//     })
//     .catch(error => {
//         console.error('Failed to send question:', error);
//         document.getElementById('eda_questionAnswer').textContent = 'Failed to send question';
//     });
// }



// table line js

// function sendQuestion() {
//     const question = document.getElementById('question_eda').value;
//     fetch('/Eda_Process', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ question })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         // Parse JSON string to array if it's a string
//         if (typeof data.output_any === 'string') {
//             data.output_any = JSON.parse(data.output_any);
//         }

//         // Check the type of output and display accordingly
//         switch(data.output_type) {
//             case 'table':
//                 // Assuming data is an array of objects
//                 if (Array.isArray(data.output_any)) {
//                     let tableHTML = '<table style="border-collapse: collapse;"><thead><tr>';
//                     Object.keys(data.output_any[0]).forEach(key => {
//                         tableHTML += `<th style="border: 1px solid black; padding: 8px;">${key}</th>`;
//                     });
//                     tableHTML += '</tr></thead><tbody>';
//                     data.output_any.forEach(row => {
//                         tableHTML += '<tr>';
//                         Object.values(row).forEach(value => {
//                             tableHTML += `<td style="border: 1px solid black; padding: 8px;">${value}</td>`;
//                         });
//                         tableHTML += '</tr>';
//                     });
//                     tableHTML += '</tbody></table>';
//                     document.getElementById('eda_questionAnswer').innerHTML = tableHTML;
//                 } else {
//                     // Handle invalid table data
//                     document.getElementById('eda_questionAnswer').textContent = 'Invalid table data';
//                 }
//                 break;
//             case 'numeric':
//             case 'text':
//                 // Directly display numeric and text data
//                 document.getElementById('eda_questionAnswer').textContent = data.output_any;
//                 break;
//             default:
//                 // Handle unknown type
//                 document.getElementById('eda_questionAnswer').textContent = data.output_any;
//         }
//     })
//     .catch(error => {
//         console.error('Failed to send question:', error);
//         document.getElementById('eda_questionAnswer').textContent = 'Failed to send question';
//     });
// }



// table line js with image handle js

function sendQuestion() {
  const question = document.getElementById('question_eda').value;
  $("#waitImg").show(); // Show the loading image
  fetch('/Eda_Process', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      $("#waitImg").hide(); // Hide the loading image on success
      $('#message').text(data.message);
      setTimeout(function() {
        $('#message').text('');
      }, 8000); // 8 seconds ke baad delete
      // Parse JSON string to array if it's a string
      if (typeof data.output_any === 'string') {
          data.output_any = JSON.parse(data.output_any);
          $("#waitImg").hide(); // Hide the loading image on success
          $('#message').text(data.message);
          setTimeout(function() {
            $('#message').text('');
          }, 8000); // 8 seconds ke baad delete
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

  })
  .catch(error => {
      console.error('Failed to send question:', error);
      document.getElementById('eda_questionAnswer').textContent = 'Failed to send question';
  });
}
