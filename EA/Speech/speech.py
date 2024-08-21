from flask_socketio import emit
from gtts import gTTS
from io import BytesIO
import base64

def speak(audio, voice):
    try:
        print(voice)
        # Set language based on the voice type
        lang = 'en' if voice == "male" else 'en'  # Adjust this if you want different languages for different voices

        print("speak function called!")
        tts = gTTS(text=audio, lang=lang)
        
        # Save to a BytesIO object
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        # Convert the BytesIO audio data to base64
        audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')

        print("speech ended")
        emit("speech", {'message': "Speech ended", 'audio': audio_base64})

    except Exception as e:
        print(f"An error occurred: {e}")
