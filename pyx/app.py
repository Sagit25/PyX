
from .createElement import createElement

from flask import Flask, send_from_directory
from flask_socketio import SocketIO
import inspect
import os

class User:
    def __init__(self, socket, sid):
        self.socket = socket
        self.sid = sid

    def emit(self, event, data):
        self.socket.emit(event, data)


class App:
    def __init__(self):
        self.users = {} # {sid(str): User}

    def __render__(self, user):
        return createElement('div', {}, 'Hello World')

    def run(self, host, port):
        running_path = os.path.dirname(os.path.abspath(inspect.getmodule(inspect.stack()[1][0]).__file__))
        module_path = os.path.dirname(os.path.abspath(__file__))
        
        # Create public folder if it doesn't exist
        if not os.path.exists(os.path.join(running_path, 'public')):
            os.makedirs(os.path.join(running_path, 'public'))
        
        # Create index.html if it doesn't exist
        if not os.path.exists(os.path.join(running_path, 'public', 'index.html')):
            with open(os.path.join(module_path, 'assets', 'index.html'), 'r') as f:
                with open(os.path.join(running_path, 'public', 'index.html'), 'w') as f2:
                    f2.write(f.read())
        
        app = Flask(__name__, static_folder=os.path.join(running_path, 'public')) 
        socketio = SocketIO(app)

        @app.route('/')
        def index():
            return send_from_directory(os.path.join(running_path, 'public'), 'index.html')

        @app.route('/<path:path>')
        def serve(path):
            return send_from_directory(os.path.join(running_path, 'public'), path)

        @socketio.on('connect')
        def connect():
            self.users[request.sid] = User(socketio, request.sid)
        
        @socketio.on('disconnect')
        def disconnect():
            del self.users[request.sid]

        socketio.run(app, host=host, port=port)
