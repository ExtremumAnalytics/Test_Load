(function ($) {

    // Readiness Chart
    $(document).ready(function() {
        const socket = io();
        const ctx2 = $("#readiness_chart").get(0).getContext("2d");
        const myChart2 = new Chart(ctx2,{
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
            updateReadinessChart(data);
        });
        
        // Function to update readiness chart
        function updateReadinessChart(data) {
            myChart2.data.datasets[0].data = [
                data.x,
                100 - data.x
            ];
            myChart2.update(); // Refresh the chart
        }
    });
    
    // New Sentiment Chart
    $(document).ready(function() {
        const socket = io();

        var ctx3 = $("#sentiment_chart").get(0).getContext("2d");
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
                        formatter: (value, ctx3) => {
                            let sum = 0;
                            let dataArr = ctx3.chart.data.datasets[0].data;
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

        socket.on('analyze_sentiment_summ', function(data) {
            updateSummaryBarChart(data);
        });

        // Function to update sentiment chart
        function updateSummaryBarChart(data) {
            myChart3.data.datasets[0].data = data.values;
            myChart3.data.labels = data.labels;
            myChart3.update(); // Refresh the chart
        }
    });

})(jQuery);

