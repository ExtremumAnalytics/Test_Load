const form = document.getElementById("my-form");
const checkboxes = form.querySelectorAll("input[type='radio']");

checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        fetch("/checkbox", {
            method: "POST",
            body: new FormData(form)
        })
        .then(response => response.text())
        .then(data => console.log(data))  // Handle response from server
        .catch(error => console.error(error));
    });
});
