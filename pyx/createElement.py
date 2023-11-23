
def createElement(tag, attrs, *children):
    # TODO: Serialize other types
    return {
        'tag': tag,
        'attrs': attrs,
        'children': children
    }
