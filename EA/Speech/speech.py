import pyttsx3
from flask_socketio import emit


def speak(audio, voice):
   try:
        print(voice)
        engine = pyttsx3.init()
        voices = engine.getProperty("voices")
        engine.setProperty("rate", 170)
        if voice=="male":
            engine.setProperty("voice", voices[0].id)
            print("Male voice set---->")
        else:
            engine.setProperty("voice", voices[1].id)
            print("Female Voice set----->")

        print("speak function called!")
        engine.say(audio)
        engine.runAndWait()
        engine.stop()
        print("speech ended")
        emit("speech",{'message':"Speech ended"})

   except Exception as e:
       print(f"An error occurred: {e}")


