import app, { nextApp } from "./src/app";
import { connectDB } from "./src/config/database";
import { createServer } from "http";
import { initializeSocket } from "./src/utils/socket";

const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

initializeSocket(httpServer);

// index.ts
async function startServer() {
    try {
        await connectDB();

        httpServer.listen(PORT, "0.0.0.0", () => {
            console.log(`Server listening on PORT: ${PORT}`);
        });

        console.log("Preparing Next.js...");
        await nextApp.prepare();
        console.log("Next.js ready!");

    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
}

startServer();