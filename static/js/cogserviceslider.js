// Summary Page Word Count Slider
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById("mySlider");
  const valueBox = document.querySelector(".value-box");
  const socket = io();

  // Update the value box when the slider changes
  slider.addEventListener("input", () => {
      valueBox.textContent = slider.value;
  });

  // Send a Socket.IO event to the server when the slider changes
  slider.addEventListener("change", () => {
      socket.emit('Cogservice_Value_Updated', { value: slider.value });
  });

  // Handle the response from the server
  socket.on('cogservice_response', (data) => {
      if (data.message) {
          console.log(data.message); // Log success message
      } else if (data.error) {
          console.error(data.error); // Log error message
      }
  });
});
