import express from "express";
import path from "path";
import next from "next";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ 
    dev, 
    dir: path.join(import.meta.dir, "../../web"),
    hostname: "localhost",
    port: 3000
});
const handle = nextApp.getRequestHandler();

const app = express();

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

app.all(/^(?!\/api).+/, (req, res) => {
    return handle(req, res);
});

export { nextApp };
export default app;