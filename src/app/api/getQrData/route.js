import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    console.log("🚀 ~ GET ~ uid:", uid)
    let qrcodes;
    let design;
    if (uid) {
      qrcodes = await prisma.qRCode.findUnique({
        where: { unique_id : uid }
      });
      design = await prisma.Design.findUnique({
        where: { qr_unique_id : uid }
      })
      if (!qrcodes) {
        return NextResponse.json({ error: "QR code not found" }, { status: 404 });
      }
    } else {
      qrcodes = await prisma.qRCode.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    }
    let reversePayload = {...qrcodes, ...design};
    return NextResponse.json(reversePayload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching QR codes" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}