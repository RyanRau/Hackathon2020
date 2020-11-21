import speech_recognition as sr
import json
import random
from flask import Flask, jsonify, render_template
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app)


# Speech to text conversion
####################################################################################################
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
####################################################################################################


# Mixology Page
####################################################################################################
@app.route('/mixology')
def mixology():
    return render_template('mixology/questionnaire.html')


@app.route('/mixology/reset')
def reset_mixology():
    data = {
        'mixology_player_count': 0,
        'finished_count': 0
    }
    with open('player_count.json', 'w') as outfile:
        json.dump(data, outfile)
    return """Data was reset"""


@app.route('/mixology/drinks/<int:drinkNum>')
def getDrink(drinkNum):
    with open('drinks.json') as json_file:
        data = json.load(json_file)
        drinks = data['drinks']
        drink = drinks[drinkNum]
    return render_template('mixology/drink.html', drink=drink)

def callback_function(methods=['GET', 'POST']):
    print('message was received!!!')


@socketio.on('userResponse')
def user_response_handler(json_msg, methods=['GET', 'POST']):
    with open('player_count.json') as json_file:
        data = json.load(json_file)
        mixology_player_count = data['mixology_player_count']
        finished_count = data['finished_count']

    msg = json_msg['data']
    print(msg)

    if (msg == "connected"):
        mixology_player_count += 1

    if (msg == "finished"):
        finished_count += 1
    

    data = {
        'mixology_player_count': mixology_player_count,
        'finished_count': finished_count
    }
    with open('player_count.json', 'w') as outfile:
        json.dump(data, outfile)


    is_finished = (mixology_player_count != 0) and (mixology_player_count == finished_count)
    response = {
        'isDone': is_finished,
        'count': str(finished_count) + '/' + str(mixology_player_count),
        'drinkNum': random.randint(0,4)
    }
    socketio.emit('serverResponse', response, callback=callback_function)

    print(msg + '-' + str(finished_count) + '/' + str(mixology_player_count))



####################################################################################################
@app.route('/')
def sessions():
    return render_template('session.html')


def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')


@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)


if __name__ == '__main__':
    # app.run(debug=True)
    socketio.run(app, debug=True, host= '0.0.0.0')