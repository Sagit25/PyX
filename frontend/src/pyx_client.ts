
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type PyXElement = {
    type: string;
    props: {[key: string]: any};
    children: (PyXElement | string)[];
};

class PyXCient {
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

  public useRoot() {
    const [root, setRoot] = useState<PyXElement | null>(null);
    const rootLoadedRef = useRef<boolean>(false);
    const rootRequestRef = useRef<number | null>(null);
    useEffect(() => {
        this.socket.on('root', (data) => {
            const { element } = data;
            const rootElement: PyXElement = JSON.parse(element);
            setRoot(rootElement);
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
            this.socket.emit('root');
            rootRequestRef.current = setTimeout(requestRoot, 10000);
        }
    }
    useEffect(requestRoot, [root]);
    
    return root;
  }
}

export const client = new PyXCient();
