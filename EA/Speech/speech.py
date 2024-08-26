import pyttsx3
from flask_socketio import emit, SocketIO
import io
import wave
import pyaudio
import base64


def speak(audio, voice):
    try:
        print(f"Voice selected: {voice}")
        engine = pyttsx3.init()
        voices = engine.getProperty("voices")
        engine.setProperty("rate", 170)

        if voice == "male":
            engine.setProperty("voice", voices[0].id)
            print("Male voice set---->")
        else:
            engine.setProperty("voice", voices[1].id)
            print("Female Voice set----->")

        print("speak function called!")

        # Record the audio output from pyttsx3 into an in-memory buffer
        audio_buffer = io.BytesIO()
        wf = wave.open(audio_buffer, 'wb')
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit audio
        wf.setframerate(16000)

        pa = pyaudio.PyAudio()
        stream = pa.open(format=pyaudio.paInt16, channels=1, rate=16000, output=True)

        def callback(in_data, frame_count, time_info, status):
            data = stream.read(frame_count)
            wf.writeframes(data)
            return (data, pyaudio.paContinue)

        engine.say(audio)
        engine.runAndWait()

        stream.stop_stream()
        stream.close()
        pa.terminate()

        wf.close()

        # Convert audio to Base64
        audio_buffer.seek(0)
        audio_base64 = base64.b64encode(audio_buffer.getvalue()).decode('utf-8')

        print("speech ended")
        emit("speech", {'message': "Speech ended", 'audio': audio_base64})

    except Exception as e:
        print(f"An error occurred: {e}")
