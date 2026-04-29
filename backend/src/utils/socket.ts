import { Socket, Server as SocketServer } from "socket.io"
import { Server as HttpServer } from "http"
import { verifyToken } from "@clerk/express"

import { Message } from "../models/Message"
import { Chat } from "../models/Chat"
import { User } from "../models/User"

// Store online users in memory : userId -> socketId
export const onlineUsers: Map<string,string> = new Map()

export const initializeSocket = (httpServer:HttpServer) => {
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:8081",
        process.env.FRONTEND_URL,
    ].filter(Boolean) as string[]

    const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } })
    
    // Verify socket Connection
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token
        if (!token) return next(new Error("Authentication Error!"))
        
        try {
            const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! })
            const clerkId = session.sub

            const user = await User.findOne({ clerkId })
            if (!user) return next(new Error("User not found!"));
            
            socket.data.userId = user._id.toString()

            next()
        } catch (error: any) {
            next(new Error(error))
        }
    })

    // This event trigger when a new client connects to the server
    io.on("connection", (socket) => {
        const userId = socket.data.userId

        // Send the list of the current online users
        socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) })

        // Store user in onlineUsers map
        onlineUsers.set(userId, socket.id)
        
        // Notify others that if a user is online
        socket.broadcast.emit("user-online", { userId })
        
        socket.join(`user: ${userId}`)

        socket.on("join-chat", (chatId: string) => {
            socket.join(`chat: ${chatId}`)
        })

        socket.on("leave-chat", (chatId: string) => {
            socket.leave(`chat: ${chatId}`)
        })

        // Handle sending messages
        socket.on("send-message", async (data: {chatId: string, text:string}) => {

            try {
                const { chatId, text } = data

                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId,
                })

                if (!chat) {
                    socket.emit("socket-error", { message: "Chat not found..." })
                    return
                }

                const message = await Message.create({
                    chat: chatId,
                    sender: userId,
                    text,
                })

                chat.lastMessage = message._id
                chat.lastMessageAt = new Date()
                await chat.save()

                await message.populate("sender", "name avatar")

                // Emit to chat room (for users inside the chat)
                io.to(`chat: ${chatId}`).emit("new-message", message)

                // Also emit to participants personal rooms (for chat list view)
                for (const participantId of chat.participants) {
                    io.to(`user: ${participantId}`).emit("new-message", message)
                }
            } catch (error) {
                socket.emit("socket-error", { message: "Failed to send message" })
            }
        })

        // todo: later
        socket.on("typing", async (data) => { })
        
        socket.on("disconnect", () => {
            onlineUsers.delete(userId)
            
            // Notify others that the user disconnect
            socket.broadcast.emit("user-offline", { userId })
        })
    })

    return io
}