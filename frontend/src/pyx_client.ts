
import { ReactNode, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PyXElement, PyXNode } from './pyx_types';
import { convert } from './pyx_convert'

export class PyXClient {
  private socket: Socket;
  constructor() {
    this.socket = io();
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  public useRoot(): ReactNode {
    const [root, setRoot] = useState<PyXElement | null>(null);
    const rootLoadedRef = useRef<boolean>(false);
    const rootRequestRef = useRef<number | null>(null);
    useEffect(() => {
      this.socket.on('root', (data) => {
        const { element } = data;
        setRoot(element);
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
    useEffect(requestRoot, [root]);
    
    const rootElement = convert(root, this);
    return rootElement;
  }
  useRenderable(id: string): PyXNode {
    console.log('useRenderable', id);
      throw new Error("Renderable not implemented yet");
  }
}
