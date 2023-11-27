
from gevent import monkey
monkey.patch_all()

import pyx

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

class App(pyx.App):
    def __init__(self):
        super().__init__()
        self.counter = Counter()

    def __render__(self, user):
        return pyx.createElement('div', None, self.counter)

app = App()


app.run(host='0.0.0.0', port=8080)

