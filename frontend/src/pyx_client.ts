
import { ReactNode, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PyXElement } from './pyx_types';
import { convert } from './pyx_convert'

export class PyXClient {
  private socket: Socket;
  private renderable_handlers: { [id: string]: (element: PyXElement) => void };
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
