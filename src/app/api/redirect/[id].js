import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
    const { id } = params;

    try {
        // Find the QR code data by unique_id
        const qrCode = await prisma.qRCode.findUnique({
            where: { unique_id: id },
            select: { qr_code_type: true, content: true, sms_body: true }
        });

        if (!qrCode) {
            return NextResponse.json({ error: 'QR Code not found or is not dynamic.' }, { status: 404 });
        }

        const { qr_code_type, content, sms_body } = qrCode;

        if (qr_code_type === 'url') {
            const redirectUrl = content.startsWith('http') ? content : `http://${content}`;
            return NextResponse.redirect(redirectUrl);
        } else if (qr_code_type === 'sms') {
            const smsLink = `sms:${content}?body=${encodeURIComponent(sms_body || '')}`;
            return NextResponse.redirect(smsLink);
        } else {
            return NextResponse.json({ error: 'Unsupported QR Code type.' }, { status: 400 });
        }
    } catch (error) {
        console.error("Error handling QR code redirect:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
