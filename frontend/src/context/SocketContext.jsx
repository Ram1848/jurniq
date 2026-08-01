import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to backend Socket.IO
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    setSocket(newSocket);

    // Join user room on connection
    newSocket.on('connect', () => {
      newSocket.emit('join_user_room', user.user_id);
      
      // If user is a driver, maybe emit driverOnline here or let the LiveDriverStatus component handle it
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
