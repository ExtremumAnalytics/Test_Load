const slider = document.getElementById("mySlider");
const valueBox = document.querySelector(".value-box");

// Update the value box when the slider changes
slider.addEventListener("input", () => {
  valueBox.textContent = slider.value;
});

// Send a POST request to the /update_value route when the slider changes
slider.addEventListener("change", () => {
  fetch("/Cogservice_Value_Updated", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ value: slider.value })
  })
  .then(response => response.json())
  .then(data => console.log(data.message)) // Log success message
  .catch(error => console.error(error));
});


// // Update Gauge Cogniservice Chart
// function updateCharts() {
//   fetch('/graph_update')
//   .then(response => response.json())
//   .then(data => {
//       // Update Gauge Cogniservice Chart (if any)
//       var cogniChartJSON = JSON.parse(data.gauge_CogS);
//       var sentiChartJSON = JSON.parse(data.senti_summ);
//       Plotly.react('gauge-cogni', cogniChartJSON.data, cogniChartJSON.layout);
//       Plotly.react('sentiment_chart', sentiChartJSON.data, sentiChartJSON.layout);

      
//   });
// }

// // Update charts every 10 seconds (adjust as needed)
// setInterval(updateCharts, 2000);

// // Initial update
// updateCharts();