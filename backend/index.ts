import app, { nextApp } from "./src/app";
import { connectDB } from "./src/config/database";
import { createServer } from "http";
import { initializeSocket } from "./src/utils/socket";

const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

initializeSocket(httpServer);

async function startServer() {
    try {
        await connectDB();
        console.log("Successfully connected to MongoDB!");

        console.log("Preparing Next.js... (this may take a few seconds)");
        await nextApp.prepare();
        console.log("Next.js is ready!");

        httpServer.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on 0.0.0.0:${PORT}`);
        });

    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
}

startServer();