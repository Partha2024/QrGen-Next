"use client";

import { React, useEffect, useState } from "react";
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

// import { CalendarDateRangePicker } from "./components/date-range-picker"
// import { MainNav } from "./components/main-nav"
// import { Overview } from "./components/overview"
// import { RecentSales } from "./components/recent-sales"
// import { Search } from "./components/search"
// import TeamSwitcher from "./components/team-switcher"
// import { UserNav } from "./components/user-nav"

const scanByTimeOfData = [
  { month: "00", scans: 0 },
  { month: "01", scans: 2 },
  { month: "02", scans: 1 },
  { month: "03", scans: 7 },
  { month: "04", scans: 9 },
  { month: "05", scans: 10 },
  { month: "06", scans: 2 },
  { month: "07", scans: 6 },
  { month: "08", scans: 9 },
  { month: "09", scans: 1 },
  { month: "10", scans: 2 },
  { month: "11", scans: 3 },
  { month: "12", scans: 3 },
  { month: "13", scans: 3 },
  { month: "14", scans: 0 },
  { month: "15", scans: 9 },
  { month: "16", scans: 8 },
  { month: "17", scans: 8 },
  { month: "18", scans: 2 },
  { month: "19", scans: 3 },
  { month: "20", scans: 1 },
  { month: "21", scans: 1 },
  { month: "22", scans: 0 },
  { month: "23", scans: 10 },
];

const chartConfig = {
  scans: {
    label: "scans",
    color: "hsl(var(--chart-1))",
  },
  Users: {
    label: "Users",
    color: "hsl(var(--chart-2))",
  },
};

const topTenScannedQRChartData = [
  { month: "January", scans: 1 },
  { month: "February", scans: 2 },
  { month: "March", scans: 3 },
  { month: "April", scans: 4 },
  { month: "May", scans: 5 },
  { month: "June", scans: 6 },
  { month: "June", scans: 7 },
  { month: "June", scans: 8 },
  { month: "June", scans: 9 },
  { month: "June", scans: 10 },
];

const topTenScannedQRChartConfig = {
  scans: {
    label: "Total Scans",
    color: "hsl(var(--chart-3))",
  },
};

const scansByDayOfWeekChartData = [
  { month: "Monday", scans: 1 },
  { month: "Tuesday", scans: 2 },
  { month: "Wednesday", scans: 3 },
  { month: "Thursday", scans: 4 },
  { month: "Friday", scans: 5 },
  { month: "Saturday", scans: 6 },
  { month: "Sunday", scans: 7 },
];

const scanOSData = [
  { browser: "IOS", visitors: 205, fill: "var(--color-chrome)" },
  { browser: "Android", visitors: 200, fill: "var(--color-safari)" },
  { browser: "Windows", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "Mac OS", visitors: 173, fill: "var(--color-edge)" },
  { browser: "Linux", visitors: 90, fill: "var(--color-other)" },
];

const scanOSConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
};

function Analytics() {
  const [loading, setLoading] = useState(true);

  const [totalQrCodes, setTotalQrCodes] = useState([]);
  const [totalScans, setTotalScans] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [averageScanPerUser, setAverageScanPerUser] = useState([]);
  const [scanTimeLineData, setScanTimeLineData] = useState([]);
  const [topTenScannedQrCodes, setTopTenScannedQrCodes] = useState([]);

  const [timeRange, setTimeRange] = useState("90d");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("./api/analytics");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("result", result);
      console.log(result.scanTimelineData);
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
          scans: item._count.qr_code_name,
        })
      );
      setTopTenScannedQrCodes(topTenScannedQRFormattedData);
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

  useEffect(() => {
    console.log("Updated scanTimeLineData:", scanTimeLineData);
  }, [scanTimeLineData]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <div className="flex items-center space-x-2">
              <Button>Download</Button>
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
              <div className="min-h-screen grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* top 10 scanned qr codes ------------------------------ */}
                <Card className="h-[310px] col-span-1">
                  <CardHeader className="pl-6 pt-4 pb-4">
                    <CardTitle>Top 10 Scanned QR Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-0">
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
                            left: -20,
                          }}
                        >
                          <XAxis type="number" dataKey="scans" hide />
                          <YAxis
                            dataKey="qrCodeName"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
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
                  <CardHeader className="pl-6 pt-4 pb-4">
                    <CardTitle>Top 10 QR Codes By Unique Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={topTenScannedQRChartConfig}
                      className="min-h-[200px] h-[245px]"
                    >
                      <BarChart
                        accessibilityLayer
                        data={topTenScannedQRChartData}
                        layout="vertical"
                        margin={{
                          left: -20,
                        }}
                      >
                        <XAxis type="number" dataKey="scans" hide />
                        <YAxis
                          dataKey="month"
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
                          dataKey="scans"
                          fill="var(--color-scans)"
                          radius={5}
                          height={20}
                        >
                          <LabelList
                            position="right"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Scan by Time of Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={topTenScannedQRChartConfig}
                      className="min-h-[200px] h-[250px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={scanByTimeOfData}
                        margin={{
                          top: 20,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
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
                          dataKey="scans"
                          fill="var(--color-scans)"
                          radius={5}
                        >
                          <LabelList
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="h-[265px]">
                  <CardHeader className="pl-6 pt-4 pb-4">
                    <CardTitle>Scans by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={topTenScannedQRChartConfig}
                      className="min-h-[200px] h-[200px]"
                    >
                      <BarChart
                        accessibilityLayer
                        data={scansByDayOfWeekChartData}
                        layout="vertical"
                        margin={{
                          left: -20,
                        }}
                      >
                        <XAxis type="number" dataKey="scans" hide />
                        <YAxis
                          dataKey="month"
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
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="h-[265px]">
                  <CardHeader className="pl-6 pt-4 pb-4">
                    <CardTitle>Scans by Operating System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={scanOSConfig}
                      className="min-h-[200px] h-[200px]"
                    >
                      <BarChart
                        accessibilityLayer
                        data={scanOSData}
                        layout="vertical"
                        margin={{
                          left: 5,
                        }}
                      >
                        <YAxis
                          dataKey="browser"
                          type="category"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value}
                        />
                        <XAxis
                          dataKey="visitors"
                          type="number"
                          hide
                          className="w-[80%]"
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="visitors" layout="vertical" radius={5}>
                          <LabelList
                            position="right"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default Analytics;
