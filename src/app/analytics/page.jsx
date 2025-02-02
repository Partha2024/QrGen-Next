"use client";

import { React, useEffect, useState, useCallback, useRef } from "react";
import { toPng } from 'html-to-image';
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Bar,
  BarChart,
  YAxis,
  LabelList,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkPrimeSync } from "crypto";
import { LoaderCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Payment, columns } from "./components/columns_qr";
import { DataTable } from "./components/data-table_qr";

// import { CalendarDateRangePicker } from "./components/date-range-picker"
// import { MainNav } from "./components/main-nav"
// import { Overview } from "./components/overview"
// import { RecentSales } from "./components/recent-sales"
// import { Search } from "./components/search"
// import TeamSwitcher from "./components/team-switcher"
// import { UserNav } from "./components/user-nav"

const chartConfig = {
  scans: {
    label: "Total Scans",
    color: "hsl(var(--chart-1))",
  },
  Users: {
    label: "Total Users",
    color: "hsl(var(--chart-2))",
  },
};

const topTenScannedQRChartConfig = {
  scans: {
    label: "Total Scans",
    color: "#215fc0",
  },
};

const topTenQRByUniqueUsersChartConfig = {
  unique_users: {
    label: "Total Unique Users",
    color: "#215fc0",
  },
};

const scanByTimeOfDayConfig = {
  totalScans: {
    label: "Total Scans",
    color: "#215fc0",
  },
};

const scanByDayOfWeekConfig = {
  totalScans: {
    label: "Total Scans",
    color: "#215fc0",
  },
};

const scanOSConfig = {
  totalScans: {
    label: "Total Scans",
  },
  IOS: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  Android: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  Windows: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  MAC: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
};

const data = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  }
]

function Analytics() {

  const ref = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("90d");

  const [totalQrCodes, setTotalQrCodes] = useState([]);
  const [totalScans, setTotalScans] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [averageScanPerUser, setAverageScanPerUser] = useState([]);
  const [scanTimeLineData, setScanTimeLineData] = useState([]);
  const [topTenScannedQrCodes, setTopTenScannedQrCodes] = useState([]);
  const [topTenQRCodesByUniqueUsers, setTopTenQRCodesByUniqueUsers] = useState([]);
  const [scanByTimeOfDay, setScanByTimeOfDay] = useState([]);
  const [scansByDayOfWeek, setScanByScansDayOfWeek] = useState([]);
  const [scansByOS, setScansByOS] = useState([]);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("./api/analytics");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("result", result);

      setTotalQrCodes(result.totalQrCodes);
      setTotalScans(result.totalScans);
      setUniqueUsers(result.totalUniqueUsers);
      setAverageScanPerUser(result.averageScansPerUser);

      const scanTimelineFormattedData = result.scanTimelineData.map((item) => ({
        date: format(new Date(item.date), "yyyy-MM-dd"),
        scans: item.totalScans,
        Users: item.uniqueUsers,
      }));
      setScanTimeLineData(scanTimelineFormattedData);

      const topTenScannedQRFormattedData = result.topTenScannedQrCodes.map(
        (item) => ({
          qrCodeName: item.qr_code_name,
          scans: item.count,
        })
      );
      setTopTenScannedQrCodes(topTenScannedQRFormattedData);

      const topTenQRCodesByUniqueUsersFormattedData = result.topTenQrCodesByUniqueUsers.map(
        (item) => ({
          qrCodeName: item.qrCodeName,
          unique_users: Number(item.uniqueUsers),
        })
      );
      setTopTenQRCodesByUniqueUsers(topTenQRCodesByUniqueUsersFormattedData);
      
      const scanByTimeOfDayFormattedData = Array.from({ length: 24 }, (_, hour) => {
        const formattedHour = hour.toString().padStart(2, '0');
        const existingData = result.scanByTimeOfDay.find(
          (item) => item.hourOfDay === formattedHour
        );
        return {
          timeOfDay: formattedHour,
          totalScans: existingData ? existingData.count : 0,
        };
      });
      setScanByTimeOfDay(scanByTimeOfDayFormattedData);

      const scansByDayOfWeekFormattedData = Array.from({ length: 7 }, (_, day) => {
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayName = dayNames[day];
        const existingData = result.scanByDayOfWeek.find(
          (item) => item.dayOfWeek === dayName
        );
        return {
          dayOfWeek: dayName,
          totalScans: existingData ? existingData.count : 0,
        };
      });
      setScanByScansDayOfWeek(scansByDayOfWeekFormattedData);

      const scansByOSFormattedData = Array.from({ length: 5 }, (_, os) => {
        const osNames = ["IOS", "Android", "Windows", "MAC", "Linux"];
        const osName = osNames[os];
        const existingData = result.scanByOS.find(
          (item) => item.os === osName
        );
        return {
          operatingSystem: osName,
          totalScans: existingData ? existingData.count : 0,
          fill: `hsl(var(--chart-${os}))`,
        };
      });
      setScansByOS(scansByOSFormattedData);

      const formattedData = result.topScannedQR.map((qr) => {
        return {
          name: qr.qrCodeName,
          experience: qr.scanCount,
          lastModified: qr.userCount
        };
      });
      console.log("formattedData", formattedData);
      setData(formattedData);

    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredData = scanTimeLineData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date().toISOString().split("T")[0];
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const handleEdit = (uniqueId) => {
    window.location.href = "/edit?uid=" + uniqueId;
  }

  const handleDelete = async (uniqueId) => {
    console.log("delete");
  };

  const downloadAnalyticsImage = useCallback(() => {
    if (ref.current === null) {
      return
    }

    toPng(ref.current, { cacheBust: true, backgroundColor: "#fff" })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'Ananlytics.png'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }, [ref])

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="flex-col md:flex" ref={ref}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <div className="flex items-center space-x-2">
              <Button onClick={downloadAnalyticsImage}>Download</Button>
            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              {/* top card container -----------------------------------------------*/}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* total qr codes----------------------------------------- */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total QR Codes
                    </CardTitle>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto" />
                      ) : (
                        totalQrCodes
                      )}
                    </div>
                  </CardContent>
                </Card>
                {/* total scans----------------------------------------- */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Scans
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto" />
                      ) : (
                        totalScans
                      )}
                    </div>
                    {/* <p className="text-xs text-muted-foreground">
                      +20.1% from last 24 hours
                    </p> */}
                  </CardContent>
                </Card>
                {/* total unique users----------------------------------------- */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Unique Users
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto" />
                      ) : (
                        uniqueUsers
                      )}
                    </div>
                    {/* <p className="text-xs text-muted-foreground">
                      +180.1% from last 24 hours
                    </p> */}
                  </CardContent>
                </Card>
                {/* avrage scans----------------------------------------- */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Scan Per User
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto mt-[9px]" />
                      ) : (
                        averageScanPerUser
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* scan timeline ----------------------------------------- */}
              <div>
                <Card>
                  <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1 text-center sm:text-left">
                      <CardTitle>Scans and Users Timeline</CardTitle>
                      <CardDescription>
                        Showing total Scans for the last 3 months
                      </CardDescription>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
                        aria-label="Select a value"
                      >
                        <SelectValue placeholder="Last 3 months" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                          Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                          Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                          Last 7 days
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer
                      config={chartConfig}
                      className="aspect-auto h-[250px] w-full"
                    >
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto w-6" />
                      ) : (
                        <AreaChart data={filteredData}>
                          <defs>
                            <linearGradient
                              id="fillscans"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="var(--color-scans)"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-scans)"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                            <linearGradient
                              id="fillUsers"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="var(--color-Users)"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-Users)"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              });
                            }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  return new Date(value).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  );
                                }}
                                indicator="dot"
                              />
                            }
                          />
                          <Area
                            dataKey="scans"
                            type="natural"
                            fill="url(#fillscans)"
                            stroke="var(--color-scans)"
                            stackId="b"
                          />
                          <Area
                            dataKey="Users"
                            type="natural"
                            fill="url(#fillUsers)"
                            stroke="var(--color-Users)"
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
              {/* top 10 cards div ------------------------------------------------------------------------ */}
              <div className="min-h-screen grid gap-4 md:grid-cols-2">
                {/* top 10 scanned qr codes ------------------------------ */}
                <Card className="h-[310px] col-span-1">
                  <CardHeader className="pl-4 pt-4 pb-4">
                    <CardTitle>Top 10 Scanned QR Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-0 pl-4">
                    <ChartContainer
                      config={topTenScannedQRChartConfig}
                      className=" min-h-[200px] h-[245px] w-full"
                    >
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto my-auto w-6" />
                      ) : (
                        <BarChart
                          accessibilityLayer
                          data={topTenScannedQrCodes}
                          layout="vertical"
                          margin={{
                            left: -50,
                          }}
                        >
                          <XAxis type="number" dataKey="scans" hide />
                          <YAxis
                            dataKey="qrCodeName"
                            type="category"
                            tickLine={false}
                            tickMargin={0}
                            axisLine={false}
                            width={200}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                          />
                          <Bar
                            dataKey="scans"
                            fill="var(--color-scans)"
                            radius={5}
                          >
                            <LabelList
                              position="right"
                              offset={12}
                              className="fill-foreground"
                              fontSize={12}
                              />
                          </Bar>
                        </BarChart>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="h-[310px] col-span-1">
                  <CardHeader className="pl-4 pt-4 pb-4">
                    <CardTitle>Top 10 Scanned QR Codes By Unique Users</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-0 pl-4">
                    <ChartContainer
                      config={topTenQRByUniqueUsersChartConfig}
                      className=" min-h-[200px] h-[245px] w-full"
                    >
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto my-auto w-6" />
                      ) : (
                        <BarChart
                          accessibilityLayer
                          data={topTenQRCodesByUniqueUsers}
                          layout="vertical"
                          margin={{
                            left: -50,
                          }}
                        >
                          <XAxis type="number" dataKey="unique_users" hide />
                          <YAxis
                            dataKey="qrCodeName"
                            type="category"
                            tickLine={false}
                            tickMargin={0}
                            axisLine={false}
                            width={200}
                            // tickFormatter={(value) => value.slice(0, 3)}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                          />
                          <Bar
                            dataKey="unique_users"
                            fill="var(--color-unique_users)"
                            radius={5}
                          >
                            <LabelList
                              position="right"
                              offset={12}
                              className="fill-foreground"
                              fontSize={12}
                              />
                          </Bar>
                        </BarChart>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Scan by Time of Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={scanByTimeOfDayConfig}
                      className="min-h-[200px] h-[250px] w-full"
                    >
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto w-6" />
                      ) : (
                        
                        <BarChart
                        accessibilityLayer
                        data={scanByTimeOfDay}
                        margin={{
                          top: 20,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="timeOfDay"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="totalScans"
                          fill="var(--color-totalScans)"
                          radius={5}
                        >
                          {/* <LabelList
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                            /> */}
                        </Bar>
                      </BarChart>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="h-[276px]">
                  <CardHeader className="pl-6 pt-4 pb-4">
                    <CardTitle>Scans by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={scanByDayOfWeekConfig}
                      className="min-h-[200px] h-[200px] w-full"
                    >
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto w-6" />
                      ) : (
                        <BarChart
                          accessibilityLayer
                          data={scansByDayOfWeek}
                          layout="vertical"
                          margin={{
                            left: -20,
                          }}
                          >
                          <XAxis type="number" dataKey="totalScans" hide />
                          <YAxis
                            dataKey="dayOfWeek"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                            />
                          <Bar
                            dataKey="totalScans"
                            fill="var(--color-totalScans)"
                            radius={5}
                            >
                            <LabelList
                              position="right"
                              offset={12}
                              className="fill-foreground"
                              fontSize={12}
                              />
                          </Bar>
                        </BarChart>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="h-[276px]">
                  <CardHeader className="pl-6 pt-4 pb-4">
                    <CardTitle>Scans by Operating System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={scanOSConfig}
                      className="min-h-[200px] h-[200px] w-full"
                    >
                      {loading ? (
                        <LoaderCircle className="loadingSpinner mx-auto w-6" />
                      ) : (
                        <BarChart
                        accessibilityLayer
                        data={scansByOS}
                        layout="vertical"
                        margin={{
                          left: 5,
                        }}
                        >
                        <YAxis
                          dataKey="operatingSystem"
                          type="category"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value}
                          />
                        <XAxis
                          dataKey="totalScans"
                          type="number"
                          hide
                          />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                          />
                        <Bar dataKey="totalScans" layout="vertical" radius={5}>
                          <LabelList
                            position="right"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                            />
                        </Bar>
                      </BarChart>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>
                {/* top 10 country data table ---------------------------------------------*/}
                {/* <DataTable title={"Top 10 Scanning Countries"} columns={columns} data={data}>
                </DataTable>
                <DataTable title={"Top 10 Scanning Cities"} columns={columns} data={data}>
                </DataTable> */}
              </div>
                <Card>
                  <CardHeader className="pl-6 pt-4 pb-4">
                    <CardTitle>Top Scanned QR Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <LoaderCircle className="loadingSpinner mx-auto" />
                    ) : (
                      <DataTable className="rounded-lg border bg-card text-card-foreground shadow-sm" columns={columns(handleDelete, handleEdit)} data={data} />
                    )}
                  </CardContent>
                </Card> 
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default Analytics;