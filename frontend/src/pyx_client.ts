
import { ReactNode, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PyXElement } from './pyx_types';
import { convert } from './pyx_convert'

class JSObjectManager {
  private objects: { [id: string]: any };
  constructor() {
    this.objects = {};
  }
  public add(obj: any) {
    const id = "jsobj_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.objects[id] = obj;
    return id;
  }
  public get(id: string): any {
    return this.objects[id];
  }
  public remove(id: string) {
    delete this.objects[id];
  }
}

export class PyXClient {
  socket: Socket;
  private renderable_handlers: { [id: string]: (element: PyXElement) => void };
  private jsobj_manager: JSObjectManager;
  constructor() {
    this.socket = io();
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.renderable_handlers = {};

    this.socket.on('render', (data) => {
      const { id, element } = data;
      const handler = this.renderable_handlers[id];
      if (handler) {
        handler(element);
      }
    });
    
    this.jsobj_manager = new JSObjectManager();

    this.socket.on('request', (msg) => {
      const { data, callbackID } = msg;
      const response = this.handleRequest(data);
      this.socket.emit('response', { callbackID, data: response });
    });
  }

  public addJSObject(obj: any): string {
    return this.jsobj_manager.add(obj);
  }
  
  private handleRequest(data: any): any {
    if (data.type === 'jsobj_getattr') {
      const { id, key } = data;
      const obj = this.jsobj_manager.get(id);
      if (obj === undefined) {
        console.error('JS object not found: ' + id);
        return null;
      }
      if (obj[key] === undefined) return null;
      let value;
      try {
        value = obj[key];
      } catch (e) {
        console.error(e);
        return null;
      }
      if (['string', 'number', 'boolean', 'null'].includes(typeof value)) {
        return value;
      } else if (typeof value === 'object') {
        return {'__jsobj__': this.jsobj_manager.add(value)};
      }
      return null;
    }
    else if (data.type === 'jsobj_del') {
      const { id } = data;
      this.jsobj_manager.remove(id);
      return null;
    }
  }

  public useRoot(): ReactNode {
    const [rootId, setRootId] = useState<string | null>(null);
    const rootLoadedRef = useRef<boolean>(false);
    const rootRequestRef = useRef<number | null>(null);
    useEffect(() => {
      this.socket.on('root', (data) => {
        const { id } = data;
        setRootId(id);
        rootLoadedRef.current = true;
        if (rootRequestRef.current) {
          clearTimeout(rootRequestRef.current);
          rootRequestRef.current = null;
        }
      });
      return () => {
        this.socket.off('root');
      }
    }, []);
    
    const requestRoot = () => {
      if (rootRequestRef.current) {
        clearTimeout(rootRequestRef.current);
      }
      if (!rootLoadedRef.current) {
        this.socket.emit('request_root');
        rootRequestRef.current = setTimeout(requestRoot, 10000);
      }
    }
    useEffect(requestRoot, [rootId]);
    
    const rootElement = this.useRenderable(rootId);
    return rootElement;
  }
  
  useRenderable(id: string | null): ReactNode {
    const [element, setElement] = useState<PyXElement | null>(null);
    useEffect(() => {
      if (id === null) return;
      const handler = (element: PyXElement) => {
        setElement(element);
      }
      this.renderable_handlers[id] = handler;
      this.socket.emit('request_renderable', { id });
      return () => {
        delete this.renderable_handlers[id];
      }
    }, [id]);
    return (id === null) ? null : convert(element, this);
  }
}
