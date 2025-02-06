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
import { addDays, format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkPrimeSync } from "crypto";
import { LoaderCircle, QrCode, ScanQrCode, ListFilterPlus, ScanLine, Users, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRange } from "react-day-picker"
import { Payment, columns } from "./components/columns_qr";
import { DataTable } from "./components/data-table_qr";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { AutoComplete } from "./components/autocomplete"
// import { AutoComplete } from "@/components/autocomplete1"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

function Analytics() {

  const ref = useRef(null);

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("90d");

  const [qrCodesNames, setQRCodesNames] = useState({});
  const [qrCodesCountry, setQRCodesCountry] = useState({});
  const [qrCodesState, setQRCodesState] = useState({});
  const [qrCodesCity, setQRCodesCity] = useState({});

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
  const [showFilters, setShowFilters] = useState(false);

  const [date, setDate] = useState({})
  const [searchValue_qr, setSearchValue_qr] = useState('');
  const [selectedValue_qr, setSelectedValue_qr] = useState('');
  const [searchValue_country, setSearchValue_country] = useState('');
  const [selectedValue_country, setSelectedValue_country] = useState('');
  const [searchValue_state, setSearchValue_state] = useState('');
  const [selectedValue_state, setSelectedValue_state] = useState('');
  const [searchValue_city, setSearchValue_city] = useState('');
  const [selectedValue_city, setSelectedValue_city] = useState('');
  const [filterApplied, setFilterApplied] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {

      const payload = {
        dateRange: date,
        qrCodeName: selectedValue_qr,
        country: selectedValue_country,
        state: selectedValue_state,
        city: selectedValue_city,
      };

      // const response = await fetch("./api/analytics");
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
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
      setData(formattedData);

      setQRCodesNames(result.qrCodesNames);
      setQRCodesCountry(result.qrCodesCountry);
      setQRCodesState(result.qrCodesState);
      setQRCodesCity(result.qrCodesCity);
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

  function handleFilter() {
    setShowFilters(!showFilters);
  }

  function handleFilterSubmit(){
    setFilterApplied(false);
    console.log("searchValue_qr", date, selectedValue_qr, selectedValue_country, selectedValue_state, selectedValue_city);
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="flex-col md:flex" ref={ref}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex flex-col items-center justify-between space-y-2 w-full">
            <div className="w-full flex items-center justify-between space-x-2">
              <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
              <div className="grid-cols-2 space-x-2">
                <Button disabled={loading} variant="outline" className="bg-inherit500" onClick={handleFilter}>Filters<Filter /></Button>
                <Button disabled={loading} onClick={downloadAnalyticsImage}>Download</Button>
              </div>
            </div>
            { showFilters && (
              <Card className="filter-container w-full">
                <CardHeader className="p-3">
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <form>
                <fieldset disabled={loading}>
                  <div className="flex space-x-12 mb-4">
                    <div className="text-sm">
                      Start Time and Date
                      <div className="grid gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon />
                              {date?.from ? (
                                date.to ? (
                                  <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(date.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={date?.from}
                              selected={date}
                              onSelect={setDate}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="text-sm mt-[20px]">
                      {/* Search QR Code */}
                      {/* <Input className= "w-[300px] text-muted-foreground h-9" placeholder="Search QR Codes"/> */}
                      <AutoComplete
                        selectedValue={selectedValue_qr}
                        onSelectedValueChange={setSelectedValue_qr}
                        searchValue={searchValue_qr}
                        onSearchValueChange={setSearchValue_qr}
                        // items={FRAMEWORKS ?? []}
                        items={qrCodesNames ?? []}
                        // isLoading={isLoading}
                        width="300"
                        emptyMessage="No items found."
                        placeholder="Search QR Codes"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex justify-between space-x-6">
                      <div className="text-sm">
                        Filters By Geography
                        {/* <Input className= "w-[200px] text-muted-foreground h-9" placeholder="Search Country"/> */}
                        <AutoComplete
                          selectedValue={selectedValue_country}
                          onSelectedValueChange={setSelectedValue_country}
                          searchValue={searchValue_country}
                          onSearchValueChange={setSearchValue_country}
                          items={qrCodesCountry ?? []}
                          // items={FRAMEWORKS ?? []}
                          emptyMessage="No items found."
                          placeholder="Search Country"
                        />
                      </div>
                      <div className="text-sm pt-[20px]">
                        {/* State */}
                        {/* <Input className= "w-[200px] text-muted-foreground h-9" placeholder="Search State"/> */}
                        <AutoComplete
                          selectedValue={selectedValue_state}
                          onSelectedValueChange={setSelectedValue_state}
                          searchValue={searchValue_state}
                          onSearchValueChange={setSearchValue_state}
                          items={qrCodesState ?? []}
                          // items={FRAMEWORKS ?? []}
                          emptyMessage="No items found."
                          placeholder="Search State"
                        />
                      </div>
                      <div className="text-sm pt-[20px]">
                        {/* City */}
                        {/* <Input className= "w-[200px] text-muted-foreground h-9" placeholder="Search City"/> */}
                        <AutoComplete
                          selectedValue={selectedValue_city}
                          onSelectedValueChange={setSelectedValue_city}
                          searchValue={searchValue_city}
                          onSearchValueChange={setSearchValue_city}
                          items={qrCodesCity ?? []}
                          // items={FRAMEWORKS ?? []}
                          emptyMessage="No items found."
                          placeholder="Search City"
                        />
                      </div>
                    </div>
                    <div className="p-[23px] pb-0 pr-0">
                      <Button disabled={loading} className="w-18 h-9" onClick={handleFilterSubmit}>Apply{loading && <LoaderCircle className="loadingSpinner ml-1" />}</Button>
                    </div>
                  </div>
                  </fieldset>
                </form>
                </CardContent>
                {/* <CardFooter className="flex justify-end">
                  <Button className="w-16 h-9">Apply</Button>
                </CardFooter> */}
              </Card>
            )}
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              {/* top card container -----------------------------------------------*/}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* total qr codes----------------------------------------- */}
                {/* {filterApplied && ( */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total QR Codes
                      </CardTitle>
                      <QrCode size={20} color="#8f8f8f" />
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
                {/* )} */}
                {/* total scans----------------------------------------- */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Scans
                    </CardTitle>
                    <ScanQrCode size={20} color="#8f8f8f" />
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
                    <Users size={17} color="#8f8f8f" />
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
                    <ScanLine size={18} color="#8f8f8f" />
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
                  <CardHeader className="pl-6 pt-6 pb-4">
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