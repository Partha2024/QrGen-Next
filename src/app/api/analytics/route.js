import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { log } from "console";

const prisma = new PrismaClient();

export async function GET(req) {
  try {

    //total qr codes
    let totalQrCodes = await prisma.qRCode.count();
    
    //total scans
    let totalScans = await prisma.qRScan.count();

    //total unique users
    const distinctUsers = await prisma.qRScan.findMany({
      distinct: ['scan_ip_address'],
      select: {
        scan_ip_address: true,
      },
    });

    //scan timeline
    const scanTimelineData_scans = await prisma.qRScan.groupBy({
      by: ['scan_date'],
      _count: {
        _all: true,
      },
      orderBy: {
        scan_date: 'asc',
      },
    });
    const scanTimelineData = await Promise.all(
      scanTimelineData_scans.map(async (item) => {
        const uniqueUsers = await prisma.qRScan.findMany({
          where: { scan_date: item.scan_date },
          distinct: ['scan_ip_address'],
          select: {
            scan_ip_address: true,
          },
        });
        return {
          date: item.scan_date, 
          totalScans: item._count._all,
          uniqueUsers: uniqueUsers.length,
        };
      })
    );

    //top 10 scanned qr codes
    const topTenScannedQrCodes = await prisma.qRScan.groupBy({
      by: ['qr_code_name', 'qr_unique_id'], // Group by these fields
      _count: {
        qr_code_name: true,
      },
      orderBy: {
        _count: {
          qr_code_name: 'desc',
        },
      },
      take: 10,
    });

    //top 10 qr codes with most unique users

    //

    // const scanTimelineData_raw = await prisma.$queryRaw`
    //   SELECT scan_date, COUNT(*) AS totalScans, COUNT(DISTINCT scan_ip_address) AS uniqueUsers FROM qr_scans GROUP BY scan_date;`;
    // const scanTimelineData = scanTimelineData_raw.map((item) => ({
    //   date: item.scan_date,
    //   totalScans: Number(item.totalScans),
    //   uniqueUsers: Number(item.uniqueUsers),
    // }));

    const totalUniqueUsers = distinctUsers.length;
    const averageScansPerUser = parseFloat((totalScans / totalUniqueUsers).toFixed(2));
    return NextResponse.json({ totalQrCodes, totalScans, totalUniqueUsers, averageScansPerUser, scanTimelineData, topTenScannedQrCodes});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching QR codes" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}