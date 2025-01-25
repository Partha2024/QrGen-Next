import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
      distinct: ["scan_ip_address"],
      select: {
        scan_ip_address: true,
      },
    });
    const totalUniqueUsers = distinctUsers.length;

    //average scans per user
    const averageScansPerUser = parseFloat(
      (totalScans / totalUniqueUsers).toFixed(2)
    );

    //scan timeline
    const scanTimelineData_scans = await prisma.qRScan.groupBy({
      by: ["scan_date"],
      _count: {
        _all: true,
      },
      orderBy: {
        scan_date: "asc",
      },
    });
    const scanTimelineData = await Promise.all(
      scanTimelineData_scans.map(async (item) => {
        const uniqueUsers = await prisma.qRScan.findMany({
          where: { scan_date: item.scan_date },
          distinct: ["scan_ip_address"],
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
    const topTenScannedQrCodes_raw = await prisma.$queryRaw`
      SELECT qr_code_name, COUNT(*) AS count FROM qr_scans GROUP BY qr_code_name, qr_unique_id ORDER BY count DESC LIMIT 10;`;
    const topTenScannedQrCodes = topTenScannedQrCodes_raw.map((item) => ({
      qr_code_name: item.qr_code_name,
      count: parseInt(item.count, 10),
    }));
    // const topTenScannedQrCodes = await prisma.qRScan.groupBy({
    //   by: ['qr_code_name', 'qr_unique_id'], // Group by these fields
    //   _count: {
    //     qr_code_name: true,
    //   },
    //   orderBy: {
    //     _count: {
    //       qr_code_name: 'desc',
    //     },
    //   },
    //   take: 10,
    // });

    //top 10 qr codes with most unique users
    const topTenQrCodesByUniqueUsers_raw = await prisma.$queryRaw`
      SELECT qr_code_name, COUNT(DISTINCT scan_ip_address) AS unique_users 
      FROM qr_scans 
      GROUP BY qr_code_name 
      ORDER BY unique_users DESC 
      LIMIT 10;`;
    const topTenQrCodesByUniqueUsers = topTenQrCodesByUniqueUsers_raw.map(
      (item) => ({
        qrCodeName: item.qr_code_name,
        uniqueUsers: Number(item.unique_users),
      })
    );

    //scan by time of day data
    const scanByTimeOfDay_raw = await prisma.$queryRaw`
      SELECT TO_CHAR(scan_time, 'HH24') AS hour_of_day, COUNT(*) AS "count" 
      FROM qr_scans GROUP BY hour_of_day 
      ORDER BY hour_of_day`;
    const scanByTimeOfDay = scanByTimeOfDay_raw.map(
      (item) => ({
        hourOfDay: item.hour_of_day,
        count: Number(item.count),
      })
    );

    //scan by day of week
    const scanByDayOfWeek_raw = await prisma.$queryRaw`
      SELECT TO_CHAR(scan_date, 'Day') AS day_of_week, COUNT(*) AS "count" 
      FROM qr_scans 
      GROUP BY EXTRACT(DOW FROM scan_date), TO_CHAR(scan_date, 'Day') 
      ORDER BY EXTRACT(DOW FROM scan_date) ASC;`;
    
    const scanByDayOfWeek = scanByDayOfWeek_raw.map(
      (item) => ({
        dayOfWeek: item.day_of_week.trim(),
        count: Number(item.count),
      })
    );

    //scans by os
    const scanByOS_raw = await prisma.$queryRaw`
      select scan_os, COUNT(*) from qr_scans as "count" GROUP BY scan_os ORDER BY "count" DESC`;
    const scanByOS = scanByOS_raw.map((item) => ({
      os: item.scan_os,
      count: Number(item.count),
    }));

    //Top Scanned QR codes
    const topScannedQR_raw = await prisma.$queryRaw`
    select qr_code_name, count(*), COUNT(DISTINCT scan_ip_address) AS unique_users from qr_scans GROUP BY qr_code_name order by "count" desc;`
    console.log(topScannedQR_raw);

    const topScannedQR = topScannedQR_raw.map((item) => ({
      qrCodeName: item.qr_code_name,
      scanCount: Number(item.count),
      userCount: Number(item.unique_users),
    }));

    return NextResponse.json({
      totalQrCodes,
      totalScans,
      totalUniqueUsers,
      averageScansPerUser,
      scanTimelineData,
      topTenScannedQrCodes,
      topTenQrCodesByUniqueUsers,
      scanByTimeOfDay,
      scanByDayOfWeek,
      scanByOS,
      topScannedQR
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching QR codes" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
