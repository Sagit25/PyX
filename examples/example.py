
import pyx  # It is recommended to import pyx first, before importing other packages

from os import environ
PORT = int(environ.get('PORT', 5000))   # Get port from environment


class Counter:
    def __init__(self):
        self.count = 8

    def increment(self, e):
        if e.button == 0:
            self.count += 1

    def __render__(self, user):
        return pyx.createElement('div', None,
            pyx.createElement('div', None, f'count: {self.count}'),
            pyx.createElement('button', {'onClick': self.increment}, 'Increment')
        )

app = pyx.App(component=Counter())

app.run(host='0.0.0.0', port=PORT)

