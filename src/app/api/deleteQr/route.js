import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    console.log(id, req);
    if (!id) {
      return NextResponse.json(
        { error: 'QR Code ID is required.' },
        { status: 400 }
      );
    }

    // Check if the QR code exists in the database
    const existingQRCode = await prisma.qRCode.findUnique({
      where: { unique_id: id },
    });

    if (!existingQRCode) {
      return NextResponse.json(
        { error: 'QR Code not found.' },
        { status: 404 }
      );
    }

    // Delete the QR code
    await prisma.qRCode.delete({
      where: { unique_id: id },
    });

    return NextResponse.json(
      { message: 'QR Code deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting QR Code:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the QR Code.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
