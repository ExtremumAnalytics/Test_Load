// document.addEventListener("DOMContentLoaded", function() {
//   const socket = io();
//   const slider = document.getElementById("mySlider");
//   const valueBox = document.querySelector(".value-box");

//   // Update the value box when the slider changes
//   slider.addEventListener("input", () => {
//       valueBox.textContent = slider.value + " MB";
//   });

//   // Send a POST request to the /update_value route when the slider changes
//   slider.addEventListener("change", () => {
//       fetch("/update_value", {
//           method: "POST",
//           headers: {
//               "Content-Type": "application/json"
//           },
//           body: JSON.stringify({ value: slider.value })
//       })
//       .then(response => response.json())
//       // .then(response => {
//       //     console.log(response); // Log success message
//       //     // Emit the value_updated event to notify the server
//       //     console.log(response.value)
//       //     socket.emit('size_value_updated', { value: response.value });
//       // })
//       .catch(error => console.error(error));
//   });

//   // Handle the Socket.IO event
//   socket.on('size_value_updated', function(data) {
//       // alert(data.message);
//       console.log(`Updated value: ${data.value}`);
//       // Perform any additional actions, such as updating the UI
//   });
// });


document.addEventListener("DOMContentLoaded", function() {
    const socket = io();
    const slider = document.getElementById("mySlider");
    const valueBox = document.querySelector(".value-box");
  
    // Update the value box when the slider changes
    slider.addEventListener("input", () => {
        valueBox.textContent = slider.value + " MB";
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
        .then(() => {
            // Emit the size_value_updated event to notify the server
            socket.emit('size_value_updated', { value: slider.value });
        })
        .catch(error => console.error(error));
    });
  
    // Handle the Socket.IO event
    socket.on('size_value_updated', function(data) {
        console.log(`Updated value: ${data.value}`);
        // Perform any additional actions, such as updating the UI
    });
  });
  