document.addEventListener('DOMContentLoaded', function () {
    const videoInput = document.getElementById('video-input');
    const videoPlayer = document.getElementById('video-player');
    const imageContainer = document.getElementById('image-preview');

    videoInput.addEventListener('change', function (event) {
        console.log('Video input change event triggered.');

        const file = event.target.files[0];
        if (file) {
            console.log('Selected file:', file);

            const videoURL = URL.createObjectURL(file);
            videoPlayer.src = videoURL;

            console.log('Video URL:', videoURL);

            generateImages(videoURL);
        }
    });

    function generateImages(videoURL) {
        console.log('Generating images from video.');

        const video = document.createElement('video');
        video.src = videoURL;
        video.addEventListener('loadedmetadata', function () {
            const duration = video.duration;

            for (let i = 0; i < duration; i++) {
                video.currentTime = i;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const img = new Image();
                img.src = canvas.toDataURL('image/png');
                img.alt = `Frame ${i}`;
                imageContainer.appendChild(img);
            }
            console.log('Images generated successfully.');
        });
    }
});
function previewImage(input) {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = '';

            if (input.files && input.files[0]) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    preview.appendChild(img);
                };

                reader.readAsDataURL(input.files[0]);
            }
        }

function showUploadOptions() {
    console.log('Upload options are being shown.');
    var uploadOptions = document.getElementById('upload-options');
    uploadOptions.style.display = 'block';
}

function previewImages(input) {
    console.log('Previewing multiple images.');
    var previewContainer = document.getElementById('image-preview');

    // Clear existing previews
    previewContainer.innerHTML = '';

    var files = input.files;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();

        reader.onload = function (e) {
            var image = document.createElement('img');
            image.src = e.target.result;
            image.className = 'preview-image';
            previewContainer.appendChild(image);
            
            setTimeout(function () {
                image.remove();
            }, 30000);
          };

        reader.readAsDataURL(file);
    }
}
function previewVideo(input) {
    const predictContainer = document.querySelector('.predict-container');
    const videoPreview = document.createElement('div');

    // Set styling for the video preview container
    videoPreview.style.width = '100%'; // Set the width to 100%
    videoPreview.style.maxHeight = '400px'; // Set a maximum height
    videoPreview.style.overflow = 'hidden'; // Hide any overflow content

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const video = document.createElement('video');
            video.src = e.target.result;
            video.style.width = '100%'; // Set the width to 100%
            video.style.height = 'auto';
            video.controls = true;

            // Append the video element to the video preview container
            videoPreview.appendChild(video);

            // Append the video preview container to the predict container
            predictContainer.appendChild(videoPreview);
            
            // Automatically remove the video after 1/2 minute (30000 milliseconds)
            setTimeout(function () {
                videoPreview.remove();
            }, 30000);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function predictFromVideoFrames() {
    const images = document.getElementById('flex-container').getElementsByTagName('img');
    const formData = new FormData();

    for (let i = 0; i < images.length; i++) {
        const imgDataUrl = images[i].src;
        const blob = dataURLtoBlob(imgDataUrl);
        formData.append('files[]', blob, `frame_${i}.png`);
    }

    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = 'Prediction: ' + data.prediction;
    })
    .catch(error => console.error('Error:', error));
}
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
function predict(event) {
    event.preventDefault();  // Prevent the default form submission behavior

    const form = document.getElementById('upload-form');
    const resultElement = document.getElementById('result');

    const formData = new FormData(form);

    console.log('Form data:', formData);

    if (formData.has('files[]')) {
        // For multiple files
        console.log('Processing multiple files.');
        fetch('/predict', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Prediction data:', data); // Log the prediction data
            resultElement.innerText = 'Prediction: ' + data.prediction;
        })
        .catch(error => console.error('Error:', error));
    } else if (formData.has('file')) {
        // For a single file
        console.log('Processing a single file.');
        fetch('/predict', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Prediction data:', data); // Log the prediction data
            resultElement.innerText = 'Prediction: ' + data.prediction;
        })
        .catch(error => console.error('Error:', error));
    } else if (formData.has('video')) {
        // For video file
        console.log('Processing video file.');
        predictFromVideoFrames(formData);
    } else {
        console.error('No file(s) found in the FormData.');
    }
}
