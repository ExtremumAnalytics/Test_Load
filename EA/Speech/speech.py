from flask_socketio import emit
import pyttsx3
from io import BytesIO
import base64
import tempfile

def speak(audio, voice):
    try:
        print(voice)
        # Initialize the text-to-speech engine
        engine = pyttsx3.init()

        # Set voice based on the voice type
        voices = engine.getProperty('voices')
        if voice == "male":
            engine.setProperty('voice', voices[0].id)  # Typically the first voice is male
        else:
            engine.setProperty('voice', voices[1].id)  # Typically the second voice is female
        
        print("speak function called!")

        # Create a temporary file to save the speech audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as fp:
            temp_file_name = fp.name
        
        engine.save_to_file(audio, temp_file_name)
        engine.runAndWait()
        
        # Read the audio data from the temporary file
        with open(temp_file_name, 'rb') as f:
            audio_data = f.read()

        # Convert the audio data to base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')

        print("speech ended")
        emit("speech", {'message': "Speech ended", 'audio': audio_base64})

    except Exception as e:
        print(f"An error occurred: {e}")
