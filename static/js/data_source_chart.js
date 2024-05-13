var ctx1 = $("#bar_file_chart").get(0).getContext("2d");
var myChart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: ['pdf'],
        datasets: [{
            backgroundColor: [
                "rgba(0, 156, 255, 0.7)"
            ],
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
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});
    
// function updateCharts() {
//     fetch('/graph_update')
//     .then(response => response.json())
//     .then(data => {
//         // Update Chart.js Bar Chart for Sentiment Analysis
//         // if (data.senti_Q_A) {
//         //     var sentimentData = JSON.parse(data.senti_Q_A);
//         //     console.log('Data Parsed!')
//         //     console.log(sentimentData)
//         //     myChart3.data.datasets[0].data = sentimentData.data[0].x;
//         //     // myChart3.data.datasets[0].data = sentimentData;
//         //     myChart3.update(sentimentData);
//         // }

//         if (data.bar_chart_json) {
//             console.log("Data not received")
//             var bar_file_data = JSON.parse(data.bar_chart_json);
//             console.log('Data Parsed!')
//             console.log(bar_file_data)
//             // myChart1.data.datasets[0].data = bar_file_data.data[0].x;
//             // myChart3.data.datasets[0].data = sentimentData;
//             myChart1.update(bar_file_data);
//         }
//         // Update Plotly Charts
//         // if (data.gauge_Q_A) {
//         //     const gaugeQAData = JSON.parse(data.gauge_Q_A);
//         //     Plotly.react('gauge-qa', gaugeQAData.data, gaugeQAData.layout);
//         // }
        
//         // if (data.gauge_auth) {
//         //     const gaugeAuthData = JSON.parse(data.gauge_auth);
//         //     Plotly.react('gauge-auth', gaugeAuthData.data, gaugeAuthData.layout);
//         // }

//         // if (data.gauge_CogS) {
//         //     const gaugeCogSData = JSON.parse(data.gauge_CogS);
//         //     Plotly.react('gauge-CogS', gaugeCogSData.data, gaugeCogSData.layout);
//         // }

//         // if (data.indicator) {
//         //     const indicatorData = JSON.parse(data.indicator);
//         //     Plotly.react('indicator-chart', indicatorData.data, indicatorData.layout);
//         // }

//         // if (data.pie_chart) {
//         //     const pieChartData = JSON.parse(data.pie_chart);
//         //     Plotly.react('pie-chart', pieChartData.data, pieChartData.layout);
//         // }

//         // if (data.senti_summ) {
//         //     const sentiSummData = JSON.parse(data.senti_summ);
//         //     Plotly.react('senti-summ', sentiSummData.data, sentiSummData.layout);
//         // }
//     })
//     .catch(error => console.error('Error updating charts:', error));
// }

// // Update charts every 2 seconds (adjust as needed)
// setInterval(updateCharts, 2000);

// // Initial update
// updateCharts();