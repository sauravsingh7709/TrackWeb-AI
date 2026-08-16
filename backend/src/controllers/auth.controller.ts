import type { Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import prisma from "../config/prisma.js";
import { Prisma } from "../generated/client.js";


export const registerUser = async (req: Request, res: Response) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    // User must already be authenticated by Clerk
    if (!isAuthenticated || !userId) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    const { username } = req.body;

    // Validating username
    if (!username || typeof username !== "string") {
      res.status(400).json({
        error: "Username is required",
      });
      return;
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 5) {
      res.status(400).json({
        error: "Username must contain at least 5 characters",
      });
      return;
    }

    // Get user information from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      res.status(400).json({
        error: "Email is required",
      });
      return;
    }

    // Check whether this Clerk user already has an account
    const existingClerkUser = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (existingClerkUser) {
      res.status(409).json({
        error: "User is already registered",
      });
      return;
    }

    // Check username availability
    const existingUsername = await prisma.user.findUnique({
      where: {
        username: trimmedUsername,
      },
    });

    if (existingUsername) {
      res.status(409).json({
        error: "Username already exists",
      });
      return;
    }

    // Check email availability
    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      res.status(409).json({
        error: "Email already exists",
      });
      return;
    }

    // Create our application user
    try{
        const user = await prisma.user.create({
        data: {
            clerkUserId: userId,
            username: trimmedUsername,
            email,
        },
        });

        res.status(201).json({
        message: "User registered successfully",
        user,
        });
    }
    catch (error:any){
        if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        res.status(409).json({
          error: "Username, email, or Clerk user already exists",
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    console.error("Register user error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
    try{
        const { isAuthenticated, userId } = getAuth(req);

        // Check clerk authenticaton
        if (!isAuthenticated || !userId) {
          res.status(401).json({
            error: "Unauthorized access",
          });
          return;
        }
        //Find userId in Db
        const user = await prisma.user.findUnique({
          where: {
            clerkUserId: userId,
          },
        });

        if (!user) {
          res.status(404).json({
            error: "User is not registered in the application",
          });
          return;
        }

        res.status(200).json({
          message: "Current user fetched successfully",
          user,
        });
    }
    catch(error:any){
      console.error("Get current user error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
};