// JavaScript to handle Popup Modal and AJAX request
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];


// Open the modal when the button is clicked
function table_data_retrieve() {
  modal.style.display = "block";
  $.ajax({
    url: '/table_update',
    type: 'GET',
    success: function(data) {
      var fileList = document.getElementById("fileList");
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



// // Open the modal when the button is clicked
// function table_data_retrieve() {
//   modal.style.display = "block";
//   $.ajax({
//     url: '/table_update',
//     type: 'GET',
//     success: function(data) {
//       var fileList = document.getElementById("fileList");
//       for (var i = 0; i < data.length; i++) {
//         var option = document.createElement("option");
//         option.text = data[i].name;
//         option.value = data[i].url;
//         fileList.appendChild(option);
//       }
//     }
//   });
// }

// Close the modal if close button is clicked
span.onclick = function() {
  modal.style.display = "none";
}

// Close the modal if user clicks outside the modal
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}



// Load data from selected file
function loadData() {
  var selectedFileUrl = document.getElementById("fileList").value;
  $.ajax({
    url: '/Eda_Process',
    type: 'POST',
    data: JSON.stringify({ fileUrl: selectedFileUrl }),
    contentType: 'application/json',
    success: function(response) {
      // Handle success response, if needed
    }
  });
}

// $(document).ready(function() {
//   $("#eda_generate").click(function() {
//       var question = $("#question_eda").val();
//       $.ajax({
//           url: "/Eda_Process",
//           type: "POST",
//           contentType: "application/json",
//           data: JSON.stringify({ question: question }),
//           success: function(response) {
//               // Update the text response content
//               $("#eda_questionAnswer").html("<p>" + response.text + "</p>");

//               // Parse the Plotly JSON
//               var plotlyData = JSON.parse(response.graph);

//               // Render the Plotly chart
//               Plotly.newPlot('eda_graph', plotlyData.data, plotlyData.layout);
//           },
//           error: function(xhr, status, error) {
//               console.error(error);
//           }
//       });
//   });
// });

$(document).ready(function() {
    // Function to handle the rendering of data based on the response
    function renderData(data) {
        const container = document.getElementById('dataContainer');
        if (!container) {
            console.error("Container element not found.");
            return;
        }
  
        try {
            container.innerHTML = ''; // Clear previous content
  
            // Check if data is likely a table (look for table indicators such as multiple rows and columns)
            if (data.includes('|')) {
                // Assuming '|' is used to separate table columns in your text output
                let formattedTable = '<table border="1"><tr>';
                const lines = data.split('\n');
  
                lines.forEach((line, index) => {
                    if (line.trim()) { // Check if the line is not just whitespace
                        if (index === 1) { // Assuming second line is always headers (customize as needed)
                            line.split('|').forEach(header => {
                                if (header.trim()) {
                                    formattedTable += `<th>${header.trim()}</th>`;
                                }
                            });
                            formattedTable += '</tr>';
                        } else {
                            formattedTable += '<tr>';
                            line.split('|').forEach(column => {
                                if (column.trim()) {
                                    formattedTable += `<td>${column.trim()}</td>`;
                                }
                            });
                            formattedTable += '</tr>';
                        }
                    }
                });
  
                formattedTable += '</table>';
                container.innerHTML = formattedTable;
            } else {
                // If it's just text, wrap in a paragraph for better formatting
                container.innerHTML = `<p>${data}</p>`;
            }
        } catch (error) {
            console.error("Error rendering data:", error);
            container.innerHTML = "<p>Error rendering data. Please try again.</p>";
        }
    }
  
    // Function to handle fetching data on initial load or based on user input
    function fetchData(question = "") {
        $("#waitImg").show(); // Show the loading image
        $.ajax({
            url: "/Eda_Process",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ question: question }),
            success: function(response) {
                $("#waitImg").hide(); // Hide the loading image
                try {
                    // Handle the response here
                    if (response.text) {
                        renderData(response.text);
                    }
  
                    if (response.image) {
                        // Create an image element
                        var img = document.createElement('img');
  
                        // Set the source of the image to the base64 encoded string received from the server
                        img.src = "data:image/png;base64," + response.image;
  
                        // Append the image to the container
                        $("#eda_graph").html(img);
                    } else if (response.graph) {
                        // Check if the response.graph is already an object
                        if (typeof response.graph === 'string') {
                            var plotlyData = JSON.parse(response.graph);
                            Plotly.newPlot('eda_graph', plotlyData.data, plotlyData.layout);
                        } else {
                            // If it's already an object, use it directly
                            Plotly.newPlot('eda_graph', response.graph.data, response.graph.layout);
                        }
                    } else {
                        $("#eda_graph").html("<p>No graphical data provided.</p>");
                    }
                } catch (error) {
                    console.error("Error processing response:", error);
                    $("#dataContainer").html("<p>Error in processing the data.</p>");
                }
            },
            error: function(xhr, status, error) {
                $("#waitImg").hide(); // Hide the loading image
                console.error("AJAX error:", error);
                $("#dataContainer").html("<p>Failed to get response. Please try again.</p>");
            }
        });
    }
  
    // Event listener for the generate button
    $("#eda_generate").click(function() {
        var question = $("#question_eda").val();
        fetchData(question);
    });
  
    // Initial fetch with no question (default data load)
    fetchData();
  });
  