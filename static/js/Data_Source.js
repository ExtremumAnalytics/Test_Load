//container Handling

// Select Data Source Function
function selectDataSource(element, dataSourceName) {
    // Remove highlights from other data sources
    var elements = document.querySelectorAll('.bg-light');
    elements.forEach(function(el) {
        el.classList.remove('highlighted');
    });

    // Highlight the selected data source
    element.classList.add('highlighted');

    // Save the selected data source
    sessionStorage.setItem('selectedDataSource', dataSourceName);
}

// Loading the Selected Data Source
function linkSelectedDataSource() {
    var dataSource = sessionStorage.getItem('selectedDataSource'); // Get the selected data source from sessionStorage
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var image_template = document.getElementById('image_file');
    var defaultMsg = document.getElementById('defaultMsg');
    var close = document.getElementById('close');
    var load = document.getElementById('loadData');


    switch(dataSource) {
        case 'Documents':
            doc_template.style.display= 'block';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            image_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        case 'Audio File':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'block';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            image_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        case 'Web Crawling':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'block';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            image_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        case 'Source URL':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'block';
            database_template.style.display= 'none';
            image_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        case 'Database':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'block';
            image_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;
        case 'Upload Images':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none'
            image_template.style.display= 'block';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        // Add more cases as necessary for different data sources
    }
}

// Function to handle URL submission
function submitUrl() {
    var url = document.getElementById('sourceUrl').value;
    // console.log("URL submitted:", url);
    // Add your handling logic here
}

//Show Web Crawl File Manager
function displayWebCrawFileManager() {
    // Example of fetching HTML content from a server
    fetch('/file_manager')
        .then(response => response.text())
        .then(htmlContent => {
            // Open a new popup window
            var popupWindow = window.open("{{url_for('data_source')}}", "_blank", "Title", 'newwin', 'toolbar=yes, menubar=yes, scrollbars=yes, resizable=yes, width=800, height=600');

            // Write the HTML content to the popup window
            popupWindow.document.open();
            popupWindow.document.write(htmlContent);
            popupWindow.document.close();
        })
        .catch(error => console.error('Failed to load HTML content:', error));
};

// Scroll Vault Function
function scrollToVault(){
    var vault = document.getElementById('vault_container');
    vault.scrollIntoView({behavior: 'smooth'});
}

//Data Slider Handling

// Date Slider Function
$(function () {
    const socket = io();

    // Handle the Socket.IO events
    socket.on('data_received', function(data) {
        // console.log(`Received data: Min Date: ${data.min_date}, Max Date: ${data.max_date}`);
    });

    function sendDataToSocket() {
        var minDate = $("#minDate").val();
        var maxDate = $("#maxDate").val();

        // Introduce a delay of 0.5 seconds before sending data to Socket.IO
        setTimeout(function () {
            // Emit the send_data event to notify the server
            socket.emit('send_data', {
                minDate: minDate,
                maxDate: maxDate
            });
        }, 500); // 500 milliseconds = 0.5 second
    }

    // Set the initial values for the date inputs and send data automatically when the page loads
    $("#minDate, #maxDate").on("change", function() {
        sendDataToSocket(); // Send data automatically when date inputs are changed
    });
});
//slider Handling

//Limit by size slider
document.addEventListener("DOMContentLoaded", function() {
    const socket = io();
    const slider = document.getElementById("mySlider");
    const valueBox = document.querySelector(".value-box");

    // Update the value box when the slider changes
    slider.addEventListener("input", () => {
        valueBox.textContent = slider.value + " MB";
    });

    // Send a size_value_updated event to the server when the slider changes
    slider.addEventListener("change", () => {
        socket.emit('update_value', { value: slider.value });
    });

    // Handle the size_value_updated event from the server
    socket.on('size_value_updated', function(data) {
        //   console.log(`Updated value: ${data.value} MB, Message: ${data.message}`);
    });
});

// Refresh MySQL Database
function refreshDatabase(){
    console.log('Refresh');
    socket.emit('reset_database');
    // Listen for the database reset response
    socket.on('database_reset', (data) => {
        alert(data.message);
    });
}

// Charts Update
(function ($) {
    var pin = localStorage.getItem('pin');

    // Ingestion Status Chart
    $(document).ready(function() {
        const socket = io();

        const ctx2 = $("#ingestion_chart").get(0).getContext("2d");
        const myChart2 = new Chart(ctx2, {
            type: "pie",
            data: {
                labels: ['Read', 'In Progress', 'Failed'],
                datasets: [{
                    backgroundColor: [
                        "rgba(0, 156, 255, 0.7)",
                        "rgba(255, 165, 0, 0.7)",
                        "rgba(255, 10, 10, 0.7)",
                        "rgba(0, 0, 255, 0.1)"
                    ],
                    data:[0,0,0]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        color: '#ffffff',
                        formatter: (value, ctx2) => {
                            let sum = 0;
                            let dataArr = ctx2.chart.data.datasets[0].data;
                            dataArr.map(data => {
                                sum += data;
                            });
                            let percentage = (value * 100 / sum).toFixed(2) + "%";
                            return percentage;
                        },
                        display: true,
                        align: 'center',
                        anchor: 'center'
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        socket.on('updatePieChart', function(data) {
            if(data.pin==pin){
                updatePieChart(data);
            }
        });

        function updatePieChart(data) {
            myChart2.data.labels = data.labels;
            myChart2.data.datasets[0].data = data.values;
            myChart2.update();
        }
    });

    // Files Count Bar Chart
    $(document).ready(function() {
        const socket = io();

        const ctx1 = $("#bar_file_chart").get(0).getContext("2d");
        const myChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['pdf'],
                datasets: [{

                    backgroundColor: [
                        "rgba(0, 156, 255, 0.7)",
                        "rgba(156, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.1)",
                    ],
                    maxBarThickness:20,
                    data: [0]  // Start with empty data, which will be updated dynamically
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: {
                        ticks: {
                            beginAtZero: true,
                            callback: function(value) {
                                return value; // Appends a '%' sign after each value on the x-axis
                            },
                        },
                    }
                },
                plugins: {
                    datalabels: {
                        color: '#ffffff'
                    },
                    legend: {
                        display: false
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        socket.on('update_bar_chart', function(data) {
            if(data.pin==pin){
                updateBarChart(data);
            }
            // else{
            //     // document.getElementById('message').innerHTML = '<p>Login Pin Not Verified!</p>';
            //     // setTimeout(function () {
            //     //     document.getElementById('message').innerHTML = '';
            //     // }, 8000);
            // }
        });

        function updateBarChart(data) {
            // console.log(data)
            myChart1.data.labels = data.labels; // Update labels
            myChart1.data.datasets[0].data = data.values; // Update data
            myChart1.update(); // Refresh the chart
        }
    });


    $(document).ready(function() {
        const socket = io();
        const ctx3 = $("#readiness_chart").get(0).getContext("2d");
        const myChart3 = new Chart(ctx3, {
            type: "pie",
            data: {
                labels: ['Total Readiness', 'Data Left'],
                datasets: [{
                    backgroundColor: [
                        "rgba(0, 156, 255, 0.7)",
                        "rgba(156, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.1)"
                    ],
                    borderWidth: 1,
                    circumference: 180,
                    rotation: 270,
                    aspectRatio: 2,
                    borderRadius: 8,
                    cutout: 95,
                    data: [100, 0]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    datalabels: {
                        color: '#ffffff',
                        display: true,
                        align: 'center',
                        anchor: 'center'
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
 
        socket.on('update_gauge_chart', function(data) {
            if (data.pin == pin) {
                updateReadinessChart(data);
            }
        });
 
        function updateReadinessChart(data) {
            var left = 100 - data.x;
            myChart3.data.datasets[0].data = [
                Math.round(data.x),
                Math.round(left)
            ];
            myChart3.update(); // Refresh the chart
        }
    });
})(jQuery);