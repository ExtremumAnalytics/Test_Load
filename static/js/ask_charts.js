(function ($) {
    // Readiness Chart
    var ctx2 = $("#readiness_chart").get(0).getContext("2d");
    var myChart2 = new Chart(ctx2, {
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
                // aspectRatio : 1,
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
                    color: '#000',
                    // formatter: (value, ctx2) => {
                    //     let sum = 0;
                    //     let dataArr = ctx2.chart.data.datasets[0].data;
                    //     dataArr.map(data => {
                    //         sum += data;
                    //     });
                    //     let percentage = (value*1000 / sum).toFixed(2)+"%";
                    //     return percentage;
                    // },
                    display: true,
                    align: 'center',
                    anchor: 'center'
                }
            },
            // title: {
            //     position : 'below',
            //     text: 'Total Files: ',
            //     color: "rgba(0, 156, 255, 0.7)"
            // }
        },
        plugins: [ChartDataLabels]
    });

    // New Sentiment Chart using the json data
    var ctx3 = $("#ask_qa_senti_chart").get(0).getContext("2d");
    var myChart3 = new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: ["Positive", "Negative", "Neutral"],
            datasets: [{
                backgroundColor: [
                    "rgba(0, 156, 255, 0.7)",
                    "rgba(0, 156, 255, 0.5)",
                    "rgba(0, 156, 255, 0.3)"
                ],
                data: [0, 0, 0]  // Start with empty data, which will be updated dynamically
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
                            return value + "%"; // Appends a '%' sign after each value on the x-axis
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#000',
                    formatter: (value, ctx2) => {
                        let sum = 0;
                        let dataArr = ctx2.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let percentage = (value*100 / sum).toFixed(2)+"%";
                        return percentage;
                    },
                    display: true,
                    align: 'right',
                    anchor: 'center'
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    function updateCharts() {
        fetch('/graph_update')
        .then(response => response.json())
        .then(data => {
            // Update Chart.js Bar Chart for Sentiment Analysis
            if (data.senti_Q_A) {
                var sentimentData = data.senti_Q_A;
                // console.log('Data Parsed!')
                console.log(sentimentData)
                myChart3.data.datasets[0].data = sentimentData.x;
                // myChart3.data.datasets[0].data = sentimentData;
                myChart3.update(sentimentData);
            }

            if (data.gauge_Q_A) {
                // console.log("Data not received")
                var gauge_data = data.gauge_Q_A;
                // console.log('Data Parsed!')
                console.log(gauge_data)
                // myChart3.data.datasets[0].data = gauge_data.data[0].x;
                // myChart3.data.datasets[0].data = 100 - gauge_data.data[1].x;
                // myChart2.data.options.plugins.title.text = gauge_data.data[0].y;
                myChart2.data.datasets[0].data = [
                    gauge_data.x,
                    100 - gauge_data.x
                ]
                myChart2.update(gauge_data);
            }
        })
        .catch(error => console.error('Error updating charts:', error));
    }
    
    // Update charts every 2 seconds (adjust as needed)
    setInterval(updateCharts, 2000);
    
    // Initial update
    updateCharts();
    
})(jQuery);

