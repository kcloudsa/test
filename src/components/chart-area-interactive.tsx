"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/useMobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "react-i18next";
export const description = "An interactive area chart";

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");
  const { t } = useTranslation("charts");
  
  const strings = {
    title: t("title"),
    description: t("description"),
    descriptionShort: t("descriptionShort"),
    last3Months: t("last3Months"),
    last30Days: t("last30Days"),
    last7Days: t("last7Days"),
    selectLabel: t("selectLabel"),
    profitsLabel: t("profitsLabel"),
  };
  
  const chartData = [
    { date: "2025-04-01", profits: 15.2 },
    { date: "2025-04-02", profits: 8.7 },
    { date: "2025-04-03", profits: 12.4 },
    { date: "2025-04-04", profits: 18.6 },
    { date: "2025-04-05", profits: 22.1 },
    { date: "2025-04-06", profits: 19.8 },
    { date: "2025-04-07", profits: 16.3 },
    { date: "2025-04-08", profits: 25.4 },
    { date: "2025-04-09", profits: 5.2 },
    { date: "2025-04-10", profits: 17.1 },
    { date: "2025-04-11", profits: 21.3 },
    { date: "2025-04-12", profits: 18.9 },
    { date: "2025-04-13", profits: 23.2 },
    { date: "2025-04-14", profits: 11.7 },
    { date: "2025-04-15", profits: 9.8 },
    { date: "2025-04-16", profits: 11.2 },
    { date: "2025-04-17", profits: 27.8 },
    { date: "2025-04-18", profits: 24.1 },
    { date: "2025-04-19", profits: 16.7 },
    { date: "2025-04-20", profits: 7.3 },
    { date: "2025-04-21", profits: 11.4 },
    { date: "2025-04-22", profits: 15.8 },
    { date: "2025-04-23", profits: 11.9 },
    { date: "2025-04-24", profits: 25.7 },
    { date: "2025-04-25", profits: 14.8 },
    { date: "2025-04-26", profits: 6.2 },
    { date: "2025-04-27", profits: 25.1 },
    { date: "2025-04-28", profits: 10.3 },
    { date: "2025-04-29", profits: 20.9 },
    { date: "2025-04-30", profits: 28.6 },
    { date: "2025-05-01", profits: 13.2 },
    { date: "2025-05-02", profits: 19.3 },
    { date: "2025-05-03", profits: 16.4 },
    { date: "2025-05-04", profits: 25.1 },
    { date: "2025-05-05", profits: 30.2 },
    { date: "2025-05-06", profits: 31.8 },
    { date: "2025-05-07", profits: 25.3 },
    { date: "2025-05-08", profits: 12.1 },
    { date: "2025-05-09", profits: 15.7 },
    { date: "2025-05-10", profits: 19.2 },
    { date: "2025-05-11", profits: 22.1 },
    { date: "2025-05-12", profits: 13.8 },
    { date: "2025-05-13", profits: 13.7 },
    { date: "2025-05-14", profits: 28.3 },
    { date: "2025-05-15", profits: 30.1 },
    { date: "2025-05-16", profits: 22.4 },
    { date: "2025-05-17", profits: 31.9 },
    { date: "2025-05-18", profits: 20.8 },
    { date: "2025-05-19", profits: 15.6 },
    { date: "2025-05-20", profits: 12.3 },
    { date: "2025-05-21", profits: 7.1 },
    { date: "2025-05-22", profits: 6.9 },
    { date: "2025-05-23", profits: 17.2 },
    { date: "2025-05-24", profits: 19.4 },
    { date: "2025-05-25", profits: 13.9 },
    { date: "2025-05-26", profits: 14.6 },
    { date: "2025-05-27", profits: 27.3 },
    { date: "2025-05-28", profits: 15.8 },
    { date: "2025-05-29", profits: 6.7 },
    { date: "2025-05-30", profits: 22.6 },
    { date: "2025-05-31", profits: 12.8 },
    { date: "2025-06-01", profits: 12.7 },
    { date: "2025-06-02", profits: 29.8 },
    { date: "2025-06-03", profits: 8.9 },
    { date: "2025-06-04", profits: 28.1 },
    { date: "2025-06-05", profits: 7.6 },
    { date: "2025-06-06", profits: 19.3 },
    { date: "2025-06-07", profits: 21.2 },
    { date: "2025-06-08", profits: 25.1 },
    { date: "2025-06-09", profits: 28.2 },
    { date: "2025-06-10", profits: 12.8 },
    { date: "2025-06-11", profits: 8.1 },
    { date: "2025-06-12", profits: 31.3 },
    { date: "2025-06-13", profits: 7.0 },
    { date: "2025-06-14", profits: 27.6 },
    { date: "2025-06-15", profits: 20.4 },
    { date: "2025-06-16", profits: 24.2 },
    { date: "2025-06-17", profits: 30.1 },
    { date: "2025-06-18", profits: 9.2 },
    { date: "2025-06-19", profits: 22.3 },
    { date: "2025-06-20", profits: 26.8 },
    { date: "2025-06-21", profits: 13.4 },
    { date: "2025-06-22", profits: 20.9 },
    { date: "2025-06-23", profits: 30.7 },
    { date: "2025-06-24", profits: 11.1 },
    { date: "2025-06-25", profits: 11.8 },
    { date: "2025-06-26", profits: 28.4 },
    { date: "2025-06-27", profits: 29.1 },
    { date: "2025-06-28", profits: 12.6 },
    { date: "2025-06-29", profits: 8.8 },
    { date: "2025-06-30", profits: 29.0 },
  ];

  const chartConfig = {
    profits: {
      label: strings.profitsLabel,
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
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

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{strings.title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {strings.description}
          </span>
          <span className="@[540px]/card:hidden">{strings.descriptionShort}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">{strings.last3Months}</ToggleGroupItem>
            <ToggleGroupItem value="30d">{strings.last30Days}</ToggleGroupItem>
            <ToggleGroupItem value="7d">{strings.last7Days}</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label={strings.selectLabel}
            >
              <SelectValue placeholder={strings.last3Months} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                {strings.last3Months}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                {strings.last30Days}
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                {strings.last7Days}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillProfits" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
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
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="profits"
              type="natural"
              fill="url(#fillProfits)"
              stroke="var(--primary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
