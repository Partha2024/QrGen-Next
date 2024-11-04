import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        // Fetch the qr_experience type first
        const qrCode = await prisma.qRCode.findUnique({
            where: { unique_id: id },
            select: { qr_experience: true }
        });

        if (!qrCode) {
            return NextResponse.json({ error: 'QR Code not found.' }, { status: 404 });
        }

        let qrCodeDetails;

        if (qrCode.qr_experience === 'url') {
            // Fetch content_url if qr_experience is 'url'
            qrCodeDetails = await prisma.qRCode.findUnique({
                where: { unique_id: id },
                select: { qr_experience: true, content_url: true }
            });
        } else if (qrCode.qr_experience === 'sms') {
            // Fetch content_phone_number and content_sms_body if qr_experience is 'sms'
            qrCodeDetails = await prisma.qRCode.findUnique({
                where: { unique_id: id },
                select: { qr_experience: true, content_phone_number: true, content_sms_body: true }
            });
        } else {
            return NextResponse.json({ error: 'Unsupported QR Code experience type.' }, { status: 400 });
        }

        if (qrCodeDetails.qr_experience === 'url') {
            const redirectUrl = qrCodeDetails.content_url.startsWith('http://') || qrCodeDetails.content_url.startsWith('https://')
                ? qrCodeDetails.content_url
                : `http://${qrCodeDetails.content_url}`;
            return NextResponse.redirect(redirectUrl);
        } else if (qrCodeDetails.qr_experience === 'sms') {
            const smsLink = `sms:${qrCodeDetails.content_phone_number}?body=${encodeURIComponent(qrCodeDetails.content_sms_body || '')}`;
            return NextResponse.redirect(smsLink);
        }

    } catch (error) {
        console.error("Error handling QR code redirect:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
