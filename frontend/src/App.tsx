
import { useEffect } from 'react';
import socket from './socket.ts';

export default function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    return () => {
      socket.off('connect');
    }
  }, []);
  return <div></div>
}
