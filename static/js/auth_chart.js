// (function ($) {
//     "use strict";

    
//     // New Sentiment Chart using the json data
//     var ctx1 = $("bar-chart").get(0).getContext("2d");
//     var myChart1 = new Chart(ctx1, {
//         type: 'bar',
//         data: {
//             labels: [],
//             datasets: [{
//                 backgroundColor: [
//                     "rgba(0, 156, 255, 0.7)",
//                     "rgba(0, 156, 255, 0.5)",
//                     "rgba(0, 156, 255, 0.3)"
//                 ],
//                 data: [0, 0, 0]  // Start with empty data, which will be updated dynamically
//             }]
//         },
//         options: {
//             indexAxis: 'y',
//             responsive: true,
//             scales: {
//                 x: {
//                     ticks: {
//                         beginAtZero: true,
//                         callback: function(value) {
//                             return value; // Appends a '%' sign after each value on the x-axis
//                         }
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: false
//                 }
//             }
//         }
//     });

//     function updateFileCharts() {
//         fetch('/graph_update')
//         .then(response => response.json())
//         .then(data => {
//             // Update Chart.js Bar Chart for Sentiment Analysis
//             if (data.bar_chart_json) {
//                 console.log("Data not received")
//                 var bar_file_data = JSON.parse(data.bar_chart_json);
//                 console.log('Data Parsed!')
//                 console.log(bar_file_data)
//                 myChart1.data.datasets[0].data = bar_file_data.data[0].x;
//                 // myChart3.data.datasets[0].data = sentimentData;
//                 myChart1.update(bar_file_data);
//             }
//         })
//         .catch(error => console.error('Error updating charts:', error));
//     }
    
//     // Update charts every 2 seconds (adjust as needed)
//     setInterval(updateFileCharts, 2000);
    
//     // Initial update
//     updateFileCharts();
    
// })(jQuery);

