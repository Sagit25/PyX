
from .hashid import hashID

def createElement(tag, attrs, *children):
    if type(tag) != str:
        if hasattr(tag, '__render__'):  # Renderable
            tag = {
                '__renderable__': hashID(tag),
            }
    return {
        'tag': tag,
        'props': attrs,
        'children': children
    }
