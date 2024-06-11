    // Files Bar Chart
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
                    legend: {
                        display: false
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        socket.on('updateBarChart', function(data) {
            updateBarChart(data);
        });

        function updateBarChart(data) {
            myChart1.data.datasets[0].data = bar_file_data.x;
            myChart1.data.labels = bar_file_data.y;
            myChart1.update();
        }
    });