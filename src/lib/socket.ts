import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: false,
      withCredentials: true,
    });
  }
  
  if (token && socket.auth) {
    (socket.auth as { token: string }).token = token;
  }
  
  return socket;
};
