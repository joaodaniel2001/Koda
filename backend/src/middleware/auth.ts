import type { Request, Response, NextFunction } from "express"
import { getAuth } from "@clerk/express"
import { User } from "../models/User"
import { requireAuth } from "@clerk/express"

export const protectRoute = [
    requireAuth()
]