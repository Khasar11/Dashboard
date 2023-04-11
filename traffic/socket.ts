import { Socket } from "socket.io";
import { io } from "../server";

export const initSock = () => {
    
    var allClients: Socket[] = [];
    io.sockets.on('connection', (socket: Socket) => {
       allClients.push(socket);
       console.log('socket connect');
    
       socket.on('disconnect', function() {
          console.log('socket disconnect');
    
          var i = allClients.indexOf(socket);
          allClients.splice(i, 1);
       });
   
       socket.on('subscribe-display', (arg, callback) => {
            console.log(arg)
            callback('big')
       })
    });

}
