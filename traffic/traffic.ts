import path from "path";
import { app, port, server } from "../server";
export const initApp = () => {
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/index.html'));
    });
    
    server.listen(port, () => {
        console.log('listening on '+port);
    });
}