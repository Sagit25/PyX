
# A class representing a browser event object
# Should be stored only in the user object
class JSObject:
    def __init__(self, id, user):
        self.user = user
        self.id = id
    
    def __getattr__(self, key):
        ret = self.user.request({'type': 'jsobj_getattr', 'id': self.id, 'key': key})
        if isinstance(ret, dict) and '__jsobj__' in ret:
            return JSObject(ret['__jsobj__'], self.user)
        else:
            return ret
        
    def __getitem__(self, key):
        ret = self.user.request({'type': 'jsobj_getattr', 'id': self.id, 'key': key})
        if isinstance(ret, dict) and '__jsobj__' in ret:
            return JSObject(ret['__jsobj__'], self.user)
        else:
            return ret

    def __del__(self):
        self.user.emit('jsobj_del', {'id': self.id})
