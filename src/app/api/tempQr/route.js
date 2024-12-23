import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/dist/server/api-utils';
import { NextResponse } from 'next/server';
// import geoip from 'geoip-lite';
import useragent from 'useragent';

const prisma = new PrismaClient();

export async function POST(req, { params }) {
    // const { id } = await params;
    const id = "1730316765081";
    // const id = "14";

    // localhost:8080/api/redirect/1730316765081

    try {
        // Fetch the qr_experience type first
        const qrCode = await prisma.qRCode.findUnique({
            where: { unique_id: id },
            select: { qr_experience: true, qr_code_type: true, qr_code_name: true }
        });
        if (!qrCode) {
          return NextResponse.json({ error: 'QR Code not found.' }, { status: 404 });
        }
        console.log("🚀 ~ GET ~ qrCode:", qrCode.qr_experience);
        
        
        if(qrCode.qr_code_type === 'dynamic') {
          // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;  
          const ip = "106.205.156.78";  
          // const geo = geoip.lookup(ip);

          // const scan_country = geo?.country || 'Unknown';
          // const scan_state = geo?.region || 'Unknown';
          // const scan_city = geo?.city || 'Unknown';

          const scan_country = 'Unknown';
          const scan_state = 'Unknown';
          const scan_city = 'Unknown';

          const userAgent = req.headers['user-agent'];
          const agent = useragent.parse(userAgent);
          const scan_os = agent.os.toString();

          const now = new Date();
          const scan_date = now.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          // const scan_time = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS
          const scan_time = now.toISOString(); // Full ISO 8601 format (YYYY-MM-DDTHH:MM:SS)

          await prisma.qRScan.create({
            data: {
              qr_unique_id: req.body.id || id,
              qr_code_name: req.body.qr_code_name || qrCode.qr_code_name, // Replace with appropriate data
              scan_date: new Date(scan_date),
              scan_time: scan_time,
              scan_country,
              scan_state,
              scan_city,
              scan_ip_address: ip,
              scan_os,
            },
          });
          return NextResponse.json({ message: 'Scan recorded successfully' }, { status: 200 });
        }
        return NextResponse.json({ error: 'QR Code type is not dynamic' }, { status: 400 });
    } catch (error) {
        console.error("Error handling QR code redirect:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
