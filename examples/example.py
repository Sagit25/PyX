
from pyx import createElement, App

class Counter:
    def __init__(self):
        self.count = 8

    def increment(self, e):
        if e.button == 0:
            self.count += 1

    def __render__(self, user):
        return createElement('div', None,
            createElement('div', None, f'count: {self.count}'),
            createElement('button', {'onClick': self.increment}, 'Increment')
        )

class App(pyx.App):
    def __init__(self):
        super().__init__()
        self.counter = Counter()

    def __render__(self, user):
        return createElement('div', None, self.counter)

app = App()


app.run(host='0.0.0.0', port=8080)

