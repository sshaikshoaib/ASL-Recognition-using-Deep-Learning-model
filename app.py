from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

# Load your model
model = load_model('weights.h5', compile=False)  # Update with your actual path

# Define the allowed extensions for file uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Your existing Python code

def predict_image(file_path):
    labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
              'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space']

    # Process the image for prediction (you might need to resize, normalize, etc.)
    img = Image.open(file_path)
    img = img.resize((32, 32))  # Adjust the size according to your model's input shape
    img_array = np.array(img) / 255.0  # Normalize
    img_array = img_array[:,:,:3]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

    # Make prediction
    prediction = model.predict(img_array)

    predicted_class = labels[np.argmax(prediction)]
    print('Predicted class:', predicted_class)  # Log the predicted class

    return predicted_class

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        if 'files[]' not in request.files:
            return jsonify({'error': 'No file part'})

        files = request.files.getlist('files[]')
        print('Number of files:', len(files))  # Log the number of files
        print('Received files:', request.files)

        if len(files) == 1:  # Single image prediction
            file = files[0]

            if file.filename == '':
                return jsonify({'error': 'No selected file'})

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join('uploads', filename)
                file.save(file_path)

                predicted_class = predict_image(file_path)
                return jsonify({'prediction': f'Your video represents {predicted_class}'})

        elif len(files) > 1:  # Multiple images prediction
            predictions = []

            # Sort files based on the entire index as a prefix in the filename
            files = sorted(files, key=lambda x: x.filename.split('_')[0])

            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join('uploads', filename)
                    file.save(file_path)

                    predicted_class = predict_image(file_path)
                    predictions.append(predicted_class)

            predicted_word = ''.join(predictions)

            return jsonify({'prediction': f'Your images represent {predicted_word}'})

if __name__ == '__main__':
    app.run(debug=False, threaded=False)
