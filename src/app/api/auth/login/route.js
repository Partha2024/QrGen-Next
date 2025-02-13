import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const SECRET_KEY = "holaholahola";
// const SECRET_KEY = process.env.JWT_SECRET;

// Static user
const STATIC_USER = {
  id: 1,
  username: "admin",
  password: "password123",
};

export async function POST(req) {  
  const { username, password } = await req.json();

  // if (username === STATIC_USER.username && password === STATIC_USER.password) {
  //   const token = jwt.sign({ userId: STATIC_USER.id, username }, SECRET_KEY, {
  //     expiresIn: "1h",
  //   });
  //   return Response.json({ token });
  // }

  try {
    const user = await prisma.User.findUnique({ 
      where: { userid: username } 
    });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // const passwordMatch = await bcrypt.compare(password, user.password);
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid Password" }, { status: 404 });
    }

    const token = jwt.sign({ userId: user.id, email: user.userid }, SECRET_KEY, {
      expiresIn: "1h",
    });
    return NextResponse.json({ token, user: { username: user.userid, id: user.id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error Logging In" }, { status: 500 });
  }
}
