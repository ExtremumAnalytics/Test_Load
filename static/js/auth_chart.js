function updateCharts() {
    fetch('/graph_update')
    .then(response => response.json())
    .then(data => {
        // Update Bar Chart
        var barChartJSON = JSON.parse(data.bars);
        Plotly.react('bar-chart', barChartJSON.data, barChartJSON.layout);

        // Update Pie Chart
        var pieChartJSON = JSON.parse(data.pie_chart);
        Plotly.react('pie-chart', pieChartJSON.data, pieChartJSON.layout);

        // Update Gauge Auth Chart (if any)
        var authChartJSON = JSON.parse(data.gauge_auth);
        Plotly.react('gauge-auth', authChartJSON.data, authChartJSON.layout);

        // Update Indicator Chart (if any)
        var indicatorJSON = JSON.parse(data.indicator);
        Plotly.react('indicator-chart', indicatorJSON.data, indicatorJSON.layout);
    });
}

// Update charts every 10 seconds (adjust as needed)
setInterval(updateCharts, 2000);

// Initial update
updateCharts();