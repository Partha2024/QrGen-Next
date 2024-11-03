import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const qrcodes = await prisma.qRCode.findMany();
    return NextResponse.json(qrcodes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching QR codes' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}