const slider = document.getElementById("mySlider");
const valueBox = document.querySelector(".value-box");

// Update the value box when the slider changes
slider.addEventListener("input", () => {
  valueBox.textContent = slider.value;
});

// Send a POST request to the /update_value route when the slider changes
slider.addEventListener("change", () => {
  fetch("/update_value", {
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