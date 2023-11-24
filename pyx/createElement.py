
from .hashid import hashID

def convert(obj):
    if hasattr(obj, '__render__'):
        return {'__renderable__': hashID(obj)}
    elif isinstance(obj, list):
        return [convert(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: convert(v) for k, v in obj.items()}
    elif isinstance(obj, tuple):
        return tuple(convert(item) for item in obj)
    elif isinstance(obj, set):
        return {convert(item) for item in obj}
    else: # TODO: Handle other types
        return obj

def createElement(tag, props, *children):
    return {
        'tag': tag,
        'props': convert(props),
        'children': convert(children)
    }
