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
            // else{
            //     // document.getElementById('message').innerHTML = '<p>Login Pin Not Verified!</p>';
            //     // setTimeout(function () {
            //     //     document.getElementById('message').innerHTML = '';
            //     // }, 8000);
            // }
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
                    data: [10]  // Start with empty data, which will be updated dynamically
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
    
//     //Overall Readiness Chart
//     $(document).ready(function() {
//         const socket = io();

//         const ctx3 = $("#readiness_chart").get(0).getContext("2d");
//         const myChart3 = new Chart(ctx3,{
//             type: "pie",
//             data: {
//                 labels: ['Total Readiness', 'Data Left'],
//                 datasets: [{
//                     backgroundColor: [
//                         "rgba(0, 156, 255, 0.7)",
//                         "rgba(156, 0, 255, 0.7)",
//                         "rgba(0, 0, 255, 0.7)",
//                         "rgba(0, 0, 255, 0.1)",
//                     ],
//                     borderWidth: 1,
//                     circumference: 180,
//                     rotation : 270,
//                     aspectRatio : 2,
//                     borderRadius:8,
//                     cutout: 95,
//                     data: [75,25]
//                 }]
//             },
//             options: {
//                 responsive: true, 
//                 plugins: {
//                     legend: {
//                         display: true
//                     },
//                     datalabels: {
//                         color: '#ffffff',
//                         // formatter: (value, ctx3) => {
//                         //     let sum = 0;
//                         //     let dataArr = ctx3.chart.data.datasets[0].data;
//                         //     dataArr.map(data => {
//                         //         sum += data;
//                         //     });
//                         //     let percentage = (value * 1000 / sum).toFixed(2) + "%";
//                         //     return percentage;
//                         // },
//                         display: true,
//                         align: 'center',
//                         anchor: 'center'
//                     }
//                 }
//             },
//             plugins: [ChartDataLabels]
//         });

//         socket.on('update_gauge_chart', function(data) {
//             // updateReadinessChart(data);
//             if(data.pin==pin){
//                 updateReadinessChart(data);
//             }
//             // else{
//                 // document.getElementById('message').innerHTML = '<p>Login Pin Not Verified!</p>';
//                 // setTimeout(function () {
//                 //     document.getElementById('message').innerHTML = '';
//                 // }, 8000);
//             // }
//         });
    
//         function updateReadinessChart(data) {
//             myChart3.data.datasets[0].data = [
//                 data.x,
//                 100 - data.x
//             ]
//             myChart3.update(); // Refresh the chart
//         }

//     }); 
// })(jQuery);

    $(document).ready(function() {
        const socket = io();

        const ctx3 = $("#readiness_chart").get(0).getContext("2d");
        const myChart3 = new Chart(ctx3,{
            type: "pie",
            data: {
                labels: ['Total Readiness', 'Data Left'],
                datasets: [{
                    backgroundColor: [
                        "rgba(0, 156, 255, 0.7)",
                        "rgba(156, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.1)",
                    ],
                    borderWidth: 1,
                    circumference: 180,
                    rotation : 270,
                    aspectRatio : 2,
                    borderRadius:8,
                    cutout: 95,
                    data: [75,25]
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
            if(data.pin == pin){
                updateReadinessChart(data);
            }
        });

        function updateReadinessChart(data) {
            let roundedValue = parseFloat(data.x).toFixed(2);
            myChart3.data.datasets[0].data = [
                roundedValue,
                (100 - roundedValue).toFixed(2)
            ];
            myChart3.update(); // Refresh the chart
        }
    }); 

})(jQuery);
