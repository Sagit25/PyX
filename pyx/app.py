
from .createElement import createElement
from .hashid import hashID, getObj

from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO
import inspect
import os

class User:
    def __init__(self, app, sid):
        self.app = app
        self.sid = sid
        self.pending_renders = {}
        self.dependancy_map = {}    # {obj_hash(str): set(key(str))}

    def emit(self, event, data):
        self.app.socketio.emit(event, data)

    def render(self, obj):
        obj_hash = hashID(obj)
        if hasattr(obj.__class__, '__original_setattr__'):
            obj.__class__.__setattr__ = obj.__class__.__original_setattr__
        self.dependancy_map[obj_hash] = set()
        obj_old_getattr = obj.__class__.__getattribute__
        def getattr_proxy(target, key):
            self.dependancy_map[obj_hash].add(key)
            return obj_old_getattr(target, key)
        obj.__class__.__getattribute__ = getattr_proxy
        self.pending_renders[obj_hash] = obj.__render__(self)
        obj.__class__.__getattribute__ = obj_old_getattr

        obj_old_setattr = obj.__class__.__setattr__
        def setattr_proxy(target, key, value):
            ret = obj_old_setattr(target, key, value)
            if key in self.dependancy_map[obj_hash]:
                self.render(obj)
            return ret
        obj.__class__.__original_setattr__ = obj_old_setattr
        obj.__class__.__setattr__ = setattr_proxy

        self.emit('render', {'element': self.pending_renders[obj_hash], 'id': obj_hash})


class App:
    def __init__(self):
        self.users = {} # {sid(str): user(User)}
        self.flask_app = None
        self.socketio = None

    def __render__(self, user):
        return createElement('div', {}, 'Hello World')  # TODO: Change it to default page

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
            user.emit('root', {'id': hashID(self)})

        @socketio.on('request_renderable')
        def request_renderable(data):
            user = self.users[request.sid]
            obj = getObj(data['id'])
            user.render(obj)
        
        @socketio.on('eventHandler')
        def eventHandler(data):
            user = self.users[request.sid]
            obj = getObj(data['id'])
            e = data['e']
            result = obj(e)

        @socketio.on('disconnect')
        def disconnect():
            user = self.users[request.sid]
            del self.users[request.sid]

        socketio.run(app, host=host, port=port)
