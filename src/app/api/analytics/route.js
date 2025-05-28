// import { NextResponse } from "next/server";
// import { Prisma, PrismaClient } from "@prisma/client";
// import { log } from "console";

// const prisma = new PrismaClient();

// export async function POST(req) {

//   const {
//     dateRange,
//     qrCodeName,
//     country,
//     state,
//     city
//   } = await req.json();

//   try {
//     //total qr codes

//     let whereConditions = {};
//     if (qrCodeName) {
//       whereConditions.qr_unique_id = qrCodeName;
//     }
//     if (country) {
//       whereConditions.scan_country = country;
//     }
//     if (state) {
//       whereConditions.scan_state = state;
//     }
//     if (city) {
//       whereConditions.scan_city = city;
//     }
//     if (dateRange && dateRange.from && dateRange.to) {
//       whereConditions.scan_date = {
//         gte: new Date(dateRange.from), // greater than or equal to start date
//         lte: new Date(dateRange.to),   // less than or equal to end date
//       };
//     }
//     let whereConditions_q = '';

//     if (dateRange && dateRange.from && dateRange.to) {
//       whereConditions_q += ` AND scan_date >= '${new Date(dateRange.from).toISOString()}' AND scan_date <= '${new Date(dateRange.to).toISOString()}'`;
//     }
//     if (qrCodeName) {
//       whereConditions_q += ` AND qr_unique_id = '${qrCodeName}'`;
//     }
//     if (country) {
//       whereConditions_q += ` AND scan_country = '${country}'`;
//     }
//     if (state) {
//       whereConditions_q += ` AND scan_state = '${state}'`;
//     }
//     if (city) {
//       whereConditions_q += ` AND scan_city = '${city}'`;
//     }

//     let totalQrCodes = await prisma.qRCode.count({
//       // where: whereConditions,
//       where: { qr_code_type: "dynamic" }
//     });

//     //total scans
//     var totalScans = await prisma.qRScan.count({
//       where: whereConditions,
//     })

//     //total unique users
//     const distinctUsers = await prisma.qRScan.findMany({
//       distinct: ["scan_ip_hash"],
//       where: whereConditions,
//       select: {
//         scan_ip_hash: true,
//       },
//     });
//     const totalUniqueUsers = distinctUsers.length;

//     //average scans per user
//     const averageScansPerUser = parseFloat(
//       (totalScans / totalUniqueUsers).toFixed(2)
//     );

//     //scan timeline
//     const scanTimelineData_scans = await prisma.qRScan.groupBy({
//       by: ["scan_date"],
//       _count: {
//         _all: true,
//       },
//       where: whereConditions,
//       orderBy: {
//         scan_date: "asc",
//       },
//     });
//     const scanTimelineData = await Promise.all(
//       scanTimelineData_scans.map(async (item) => {
//         const uniqueUsers = await prisma.qRScan.findMany({
//           // where: { scan_date: item.scan_date },
//           where: { scan_date: item.scan_date, ...whereConditions }, //i have to change this to something where to and from are not used
//           distinct: ["scan_ip_hash"],
//           select: {
//             scan_ip_hash: true,
//           },
//         });
//         return {
//           date: item.scan_date,
//           totalScans: item._count._all,
//           uniqueUsers: uniqueUsers.length,
//         };
//       })
//     );

//     //top 10 scanned qr codes
//     const topTenScannedQrCodes_raw = await prisma.$queryRaw`
//       SELECT qr_code_name, COUNT(*) AS count FROM qr_scans
//       WHERE 1=1 ${Prisma.raw(whereConditions_q)}
//       GROUP BY qr_code_name, qr_unique_id ORDER BY count DESC LIMIT 10;`;
//     const topTenScannedQrCodes = topTenScannedQrCodes_raw.map((item) => ({
//       qr_code_name: item.qr_code_name,
//       count: parseInt(item.count, 10),
//     }));

//     //top 10 qr codes with most unique users
//     const topTenQrCodesByUniqueUsers_raw = await prisma.$queryRaw`
//       SELECT qr_code_name, COUNT(DISTINCT scan_ip_hash) AS unique_users
//       FROM qr_scans
//       WHERE 1=1 ${Prisma.raw(whereConditions_q)}
//       GROUP BY qr_code_name
//       ORDER BY unique_users DESC
//       LIMIT 10;`;
//     const topTenQrCodesByUniqueUsers = topTenQrCodesByUniqueUsers_raw.map(
//       (item) => ({
//         qrCodeName: item.qr_code_name,
//         uniqueUsers: Number(item.unique_users),
//       })
//     );

//     //scan by time of day data
//     const scanByTimeOfDay_raw = await prisma.$queryRaw`
//       SELECT TO_CHAR(scan_time, 'HH24') AS hour_of_day, COUNT(*) AS "count"
//       FROM qr_scans WHERE 1=1 ${Prisma.raw(whereConditions_q)}
//       GROUP BY hour_of_day
//       ORDER BY hour_of_day`;
//     const scanByTimeOfDay = scanByTimeOfDay_raw.map(
//       (item) => ({
//         hourOfDay: item.hour_of_day,
//         count: Number(item.count),
//       })
//     );

//     //scan by day of week
//     const scanByDayOfWeek_raw = await prisma.$queryRaw`
//       SELECT TO_CHAR(scan_date, 'Day') AS day_of_week, COUNT(*) AS "count"
//       FROM qr_scans
//       WHERE 1=1 ${Prisma.raw(whereConditions_q)}
//       GROUP BY EXTRACT(DOW FROM scan_date), TO_CHAR(scan_date, 'Day')
//       ORDER BY EXTRACT(DOW FROM scan_date) ASC;`;

//     const scanByDayOfWeek = scanByDayOfWeek_raw.map(
//       (item) => ({
//         dayOfWeek: item.day_of_week.trim(),
//         count: Number(item.count),
//       })
//     );

//     //scans by operating system
//     const scanByOS_raw = await prisma.$queryRaw`
//     select scan_os, COUNT(*) from qr_scans as "count"
//     WHERE 1=1 ${Prisma.raw(whereConditions_q)}
//     GROUP BY scan_os ORDER BY "count" DESC`;
//     const scanByOS = scanByOS_raw.map((item) => ({
//       os: item.scan_os,
//       count: Number(item.count),
//     }));

//     //Top Scanned QR codes
//     const topScannedQR_raw = await prisma.$queryRaw`
//     select qr_code_name, count(*), COUNT(DISTINCT scan_ip_hash) AS unique_users from qr_scans
//     WHERE 1=1 ${Prisma.raw(whereConditions_q)}
//     GROUP BY qr_code_name order by "count" desc;`

//     const topScannedQR = topScannedQR_raw.map((item) => ({
//       qrCodeName: item.qr_code_name,
//       scanCount: Number(item.count),
//       userCount: Number(item.unique_users),
//     }));

//     //Filter option Data -------------------
//     const qrCodesNames_raw = await prisma.$queryRaw`SELECT qr_unique_id, qr_code_name FROM qr_scans GROUP BY qr_code_name, qr_unique_id;`;
//     const qrCodesNames = qrCodesNames_raw.map((item) => ({
//       label: item.qr_code_name,
//       value: item.qr_unique_id,
//     }));
//     const qrCodesCountry_raw = await prisma.$queryRaw`SELECT scan_country FROM qr_scans GROUP BY scan_country;`;
//     const qrCodesCountry = qrCodesCountry_raw.map((item) => ({
//       label: item.scan_country,
//       value: item.scan_country,
//     }));
//     const qrCodesState_raw = await prisma.$queryRaw`SELECT scan_state FROM qr_scans GROUP BY scan_State;`;
//     const qrCodesState = qrCodesState_raw.map((item) => ({
//       label: item.scan_state,
//       value: item.scan_state,
//     }));
//     const qrCodesCity_raw = await prisma.$queryRaw`SELECT scan_city FROM qr_scans GROUP BY scan_city;`;
//     const qrCodesCity = qrCodesCity_raw.map((item) => ({
//       label: item.scan_city,
//       value: item.scan_city,
//     }));

//     return NextResponse.json({
//       totalQrCodes,
//       totalScans,
//       totalUniqueUsers,
//       averageScansPerUser,
//       scanTimelineData,
//       topTenScannedQrCodes,
//       topTenQrCodesByUniqueUsers,
//       scanByTimeOfDay,
//       scanByDayOfWeek,
//       scanByOS,
//       topScannedQR,
//       qrCodesNames,
//       qrCodesCountry,
//       qrCodesState,
//       qrCodesCity
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Error fetching QR codes" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let cache = {};
let lastFetched = 0;
const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes

const useCache = () => {
  return Date.now() - lastFetched < CACHE_DURATION;
};

export async function POST(req) {
  const { dateRange, qrCodeName, country, state, city } = await req.json();

  try {
    // Prepare the conditions for filtering
    let whereConditions = {};
    if (qrCodeName) whereConditions.qr_unique_id = qrCodeName;
    if (country) whereConditions.scan_country = country;
    if (state) whereConditions.scan_state = state;
    if (city) whereConditions.scan_city = city;
    if (dateRange?.from && dateRange?.to) {
      whereConditions.scan_date = {
        gte: new Date(dateRange.from),
        lte: new Date(dateRange.to),
      };
    }

    // Prepare raw query string for dynamic SQL
    let whereConditions_q = "";
    if (dateRange?.from && dateRange?.to) {
      whereConditions_q += ` AND scan_date >= '${new Date(
        dateRange.from
      ).toISOString()}' AND scan_date <= '${new Date(
        dateRange.to
      ).toISOString()}'`;
    }
    if (qrCodeName) whereConditions_q += ` AND qr_unique_id = '${qrCodeName}'`;
    if (country) whereConditions_q += ` AND scan_country = '${country}'`;
    if (state) whereConditions_q += ` AND scan_state = '${state}'`;
    if (city) whereConditions_q += ` AND scan_city = '${city}'`;

    // Use cache if available
    if (useCache()) {
      return NextResponse.json(cache);
    }

    // Start fetching data
    const [
      totalQrCodes,
      totalScans,
      distinctUsers,
      scanTimelineData_scans,
      topTenScannedQrCodes_raw,
      topTenQrCodesByUniqueUsers_raw,
      scanByTimeOfDay_raw,
      scanByDayOfWeek_raw,
      scanByOS_raw,
      topScannedQR_raw,
      qrCodesNames_raw,
      qrCodesCountry_raw,
      qrCodesState_raw,
      qrCodesCity_raw,
    ] = await Promise.all([
      prisma.qRCode.count({
        where: { qr_code_type: "dynamic" },
      }),
      prisma.qRScan.count({
        where: whereConditions,
      }),
      prisma.qRScan.findMany({
        distinct: ["scan_ip_hash"],
        where: whereConditions,
        select: { scan_ip_hash: true },
      }),
      prisma.qRScan.groupBy({
        by: ["scan_date"],
        _count: { _all: true },
        where: whereConditions,
        orderBy: { scan_date: "asc" },
      }),
      prisma.$queryRaw`SELECT qr_code_name, COUNT(*) AS count FROM qr_scans WHERE 1=1 ${Prisma.raw(
        whereConditions_q
      )} GROUP BY qr_code_name, qr_unique_id ORDER BY count DESC LIMIT 10;`,
      prisma.$queryRaw`SELECT qr_code_name, COUNT(DISTINCT scan_ip_hash) AS unique_users FROM qr_scans WHERE 1=1 ${Prisma.raw(
        whereConditions_q
      )} GROUP BY qr_code_name ORDER BY unique_users DESC LIMIT 10;`,
      prisma.$queryRaw`SELECT TO_CHAR(scan_time, 'HH24') AS hour_of_day, COUNT(*) AS "count" FROM qr_scans WHERE 1=1 ${Prisma.raw(
        whereConditions_q
      )} GROUP BY hour_of_day ORDER BY hour_of_day;`,
      prisma.$queryRaw`SELECT TO_CHAR(scan_date, 'Day') AS day_of_week, COUNT(*) AS "count" FROM qr_scans WHERE 1=1 ${Prisma.raw(
        whereConditions_q
      )} GROUP BY EXTRACT(DOW FROM scan_date), TO_CHAR(scan_date, 'Day') ORDER BY EXTRACT(DOW FROM scan_date) ASC;`,
      prisma.$queryRaw`SELECT scan_os, COUNT(*) FROM qr_scans WHERE 1=1 ${Prisma.raw(
        whereConditions_q
      )} GROUP BY scan_os ORDER BY "count" DESC;`,
      prisma.$queryRaw`SELECT qr_code_name, count(*), COUNT(DISTINCT scan_ip_hash) AS unique_users FROM qr_scans WHERE 1=1 ${Prisma.raw(
        whereConditions_q
      )} GROUP BY qr_code_name ORDER BY "count" DESC;`,
      prisma.$queryRaw`SELECT qr_unique_id, qr_code_name FROM qr_scans GROUP BY qr_code_name, qr_unique_id;`,
      prisma.$queryRaw`SELECT scan_country FROM qr_scans GROUP BY scan_country;`,
      prisma.$queryRaw`SELECT scan_state FROM qr_scans GROUP BY scan_state;`,
      prisma.$queryRaw`SELECT scan_city FROM qr_scans GROUP BY scan_city;`,
    ]);

    // Calculate additional metrics
    const totalUniqueUsers = distinctUsers.length;
    const averageScansPerUser = parseFloat(
      (totalScans / totalUniqueUsers).toFixed(2)
    );

    const scanTimelineData = await Promise.all(
      scanTimelineData_scans.map(async (item) => {
        const uniqueUsers = await prisma.qRScan.findMany({
          where: { scan_date: item.scan_date, ...whereConditions },
          distinct: ["scan_ip_hash"],
          select: { scan_ip_hash: true },
        });
        return {
          date: item.scan_date,
          totalScans: item._count._all,
          uniqueUsers: uniqueUsers.length,
        };
      })
    );

    // Prepare the response
    const response = {
      totalQrCodes,
      totalScans,
      totalUniqueUsers,
      averageScansPerUser,
      scanTimelineData,
      topTenScannedQrCodes: topTenScannedQrCodes_raw.map((item) => ({
        qr_code_name: item.qr_code_name,
        count: parseInt(item.count, 10),
      })),
      topTenQrCodesByUniqueUsers: topTenQrCodesByUniqueUsers_raw.map(
        (item) => ({
          qrCodeName: item.qr_code_name,
          uniqueUsers: Number(item.unique_users),
        })
      ),
      scanByTimeOfDay: scanByTimeOfDay_raw.map((item) => ({
        hourOfDay: item.hour_of_day,
        count: Number(item.count),
      })),
      scanByDayOfWeek: scanByDayOfWeek_raw.map((item) => ({
        dayOfWeek: item.day_of_week.trim(),
        count: Number(item.count),
      })),
      scanByOS: scanByOS_raw.map((item) => ({
        os: item.scan_os,
        count: Number(item.count),
      })),
      topScannedQR: topScannedQR_raw.map((item) => ({
        qrCodeName: item.qr_code_name,
        scanCount: Number(item.count),
        userCount: Number(item.unique_users),
      })),
      qrCodesNames: qrCodesNames_raw.map((item) => ({
        label: item.qr_code_name,
        value: item.qr_unique_id,
      })),
      qrCodesCountry: qrCodesCountry_raw.map((item) => ({
        label: item.scan_country,
        value: item.scan_country,
      })),
      qrCodesState: qrCodesState_raw.map((item) => ({
        label: item.scan_state,
        value: item.scan_state,
      })),
      qrCodesCity: qrCodesCity_raw.map((item) => ({
        label: item.scan_city,
        value: item.scan_city,
      })),
    };
    // Cache the data if not cached
    if (!useCache()) {
      cache = { ...response };
      lastFetched = Date.now();
    }

    return NextResponse.json(response);
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
