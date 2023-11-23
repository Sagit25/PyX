
from .createElement import createElement

from flask import Flask, send_from_directory
from flask_socketio import SocketIO
import inspect
import os

class App:
    def __init__(self):
        pass

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
            print('connected')
            

        @socketio.on('disconnect')
        def disconnect():
            print('disconnected')

        socketio.run(app, host=host, port=port)
