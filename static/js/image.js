var pin = localStorage.getItem('pin');

// Updating Wordcloud Image FUnction
function updateImage() {
    var image = document.getElementById('wordcloud-image');
    var timestamp = new Date().getTime(); // Generate timestamp to ensure the image is not cached
    //image.src = "../static/images/wordcloud.png?t=" + timestamp;
    image.src = "../static/login/"+ pin +"/wordcloud.png?t=" + timestamp;
}

// Call updateImage function every 5 seconds
setInterval(updateImage, 5000);

// Loading Updated wordcloud image
document.addEventListener('DOMContentLoaded', function() {
    var image = document.getElementById('wordcloud-link');

    image.addEventListener('click', function() {
        var fullImageOverlay = document.createElement('div');
        fullImageOverlay.id = 'full-image-overlay';

        var fullImage = document.createElement('img');
        //fullImage.src = "../static/images/wordcloud.png?t=" + new Date().getTime(); // Append timestamp to ensure image refresh
        fullImage.src = "../static/login/"+ pin +"/wordcloud.png?t=" + new Date().getTime(); // Append timestamp to ensure image refresh
        fullImage.id = 'full-image';

        var closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-btn';
        closeBtn.addEventListener('click', function() {
            fullImageOverlay.remove();
        });

        fullImageOverlay.appendChild(fullImage);
        fullImageOverlay.appendChild(closeBtn);

        document.body.appendChild(fullImageOverlay);
    });
});