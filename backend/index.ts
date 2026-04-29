import app from "./src/app";
import { connectDB } from "./src/config/database";
import { createServer } from "http"
import { initializeSocket } from "./src/utils/socket";

const PORT = process.env.PORT 

const httpServer = createServer(app)

initializeSocket(httpServer)

connectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            console.log(`Server is running on PORT: ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Error starting the server:", error);
        process.exit(1);
    });