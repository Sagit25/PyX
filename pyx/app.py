
from .createElement import createElement

from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO
import inspect
import os

class User:
    def __init__(self, app, sid):
        self.app = app
        self.sid = sid

    def emit(self, event, data):
        self.app.socketio.emit(event, data)


class App:
    def __init__(self):
        self.users = {} # {sid(str): User}
        self.flask_app = None
        self.socketio = None

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

        self.flask_app = app
        self.socketio = socketio

        @app.route('/')
        def index():
            return send_from_directory(os.path.join(running_path, 'public'), 'index.html')
        
        @app.route('/public/pyx.js')
        def pyxjs():
            return send_from_directory(os.path.join(module_path, 'assets'), 'pyx.js')

        @app.route('/<path:path>')
        def serve(path):
            return send_from_directory(os.path.join(running_path, 'public'), path)

        @socketio.on('connect')
        def connect():
            user = User(self, request.sid)
            self.users[request.sid] = user
        
        @socketio.on('request_root')
        def request_root():
            user = self.users[request.sid]
            user.emit('root', {'element': self.__render__(user)})

        @socketio.on('disconnect')
        def disconnect():
            user = self.users[request.sid]
            del self.users[request.sid]

        socketio.run(app, host=host, port=port)
