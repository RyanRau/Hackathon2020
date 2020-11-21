import speech_recognition as sr
from flask import Flask, jsonify

app = Flask(__name__)


# Speech to text conversion
path_to_recordings = '../discord-bot/'

def convert(file_name):
    r = sr.Recognizer()

    with sr.AudioFile(path_to_recordings + file_name) as source:
        audio_text = r.listen(source)

        try:    
            text = r.recognize_google(audio_text)
            return text
        except:
            return None


@app.route('/convert/<path:file>', methods=['GET'])
def speech_to_text(file):
    result = convert(file)
    return jsonify({'text': result})


if __name__ == '__main__':
    app.run(debug=True)