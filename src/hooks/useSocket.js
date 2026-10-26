import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../services/socket.service.js';

class MockSocket {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }
  off(event, callback) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    return this;
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
    // Also dispatch on window for cross-component simulated events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campuspulse_socket_' + event, { detail: data }));
    }
    return this;
  }
}

const mockSocketInstance = new MockSocket();

export const emitCampusEvent = (event, data) => {
  mockSocketInstance.emit(event, data);
};

export const useSocket = () => {
  const [socket, setSocket] = useState(() => getSocket() || mockSocketInstance);

  useEffect(() => {
    const s = getSocket();
    if (s) {
      setSocket(s);
    } else {
      setSocket(mockSocketInstance);
    }

    const handleCustom = (e) => {
      const type = e.type.replace('campuspulse_socket_', '');
      mockSocketInstance.emit(type, e.detail);
    };

    window.addEventListener('campuspulse_socket_issue.created', handleCustom);
    window.addEventListener('campuspulse_socket_issue.statusChanged', handleCustom);

    return () => {
      window.removeEventListener('campuspulse_socket_issue.created', handleCustom);
      window.removeEventListener('campuspulse_socket_issue.statusChanged', handleCustom);
    };
  }, []);

  return socket;
};
