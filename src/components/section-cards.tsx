import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartRadialStacked } from "@/components/ui/chart-radial-stacked";
import SaCurrency from "@/common/sa-currency";

export function SectionCards() {
  const { t } = useTranslation("charts");
  const [selectedMonth, setSelectedMonth] = useState("june");
  const [selectedOccupancyMonth, setSelectedOccupancyMonth] = useState("june");

  // Monthly collection data
  const monthlyCollectionData = {
    january: { month: "january", totalRents: 75, paidRents: 55 },
    february: { month: "february", totalRents: 78, paidRents: 62 },
    march: { month: "march", totalRents: 82, paidRents: 68 },
    april: { month: "april", totalRents: 85, paidRents: 70 },
    may: { month: "may", totalRents: 88, paidRents: 13 },
    june: { month: "june", totalRents: 80, paidRents: 60 },
    july: { month: "july", totalRents: 83, paidRents: 0 },
    august: { month: "august", totalRents: 86, paidRents: 0 },
    september: { month: "september", totalRents: 84, paidRents: 0 },
    october: { month: "october", totalRents: 87, paidRents: 0 },
    november: { month: "november", totalRents: 89, paidRents: 0 },
    december: { month: "december", totalRents: 91, paidRents: 0 },
  };

  // Monthly occupancy data
  const monthlyOccupancyData = {
    january: { month: "january", totalRents: 100, paidRents: 85 },
    february: { month: "february", totalRents: 100, paidRents: 88 },
    march: { month: "march", totalRents: 100, paidRents: 92 },
    april: { month: "april", totalRents: 100, paidRents: 89 },
    may: { month: "may", totalRents: 100, paidRents: 94 },
    june: { month: "june", totalRents: 100, paidRents: 87 },
    july: { month: "july", totalRents: 100, paidRents: 0 },
    august: { month: "august", totalRents: 100, paidRents: 0 },
    september: { month: "september", totalRents: 100, paidRents: 0 },
    october: { month: "october", totalRents: 100, paidRents: 0 },
    november: { month: "november", totalRents: 100, paidRents: 0 },
    december: { month: "december", totalRents: 100, paidRents: 0 },
  };

  const collectionChartData =
    monthlyCollectionData[selectedMonth as keyof typeof monthlyCollectionData];
  const occupancyChartData =
    monthlyOccupancyData[
      selectedOccupancyMonth as keyof typeof monthlyOccupancyData
    ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      {/* Net Income Ratio Card with Chart */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>
            {t("dashboardCards.netIncomeRatio")}
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +18.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartRadialStacked
            chartData={{
              month: t("dashboardCards.current"),
              totalRents: 100,
              paidRents: 81,
              labels: {
                chartOne: t("dashboardCards.netIncome"),
                chartTwo: t("dashboardCards.operatingCosts"),
              },
            }}
          />
        </CardContent>
        <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboardCards.netIncomeIncreased")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("dashboardCards.profitMarginImproved")}
          </div>
        </CardFooter>
      </Card>

      {/* Rent Collections Card with Chart */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>
            {t("dashboardCards.rentCollections")}
          </CardDescription>
          <CardAction>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(monthlyCollectionData).map((month) => (
                  <SelectItem key={month} value={month}>
                    {t(`months.${month}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartRadialStacked
            chartData={{
              ...collectionChartData,
              labels: {
                chartOne: t("dashboardCards.rentCollected"),
                chartTwo: t("dashboardCards.rentPending"),
              },
            }}
          />
        </CardContent>
        <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboardCards.collectionsImproved")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("dashboardCards.monthlyRentCollectionStatus")}
          </div>
        </CardFooter>
      </Card>

      {/* Occupancy Rate Card with Chart */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>{t("dashboardCards.occupancyRate")}</CardDescription>
          <CardAction>
            <Select
              value={selectedOccupancyMonth}
              onValueChange={setSelectedOccupancyMonth}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(monthlyOccupancyData).map((month) => (
                  <SelectItem key={month} value={month}>
                    {t(`months.${month}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartRadialStacked
            chartData={{
              ...occupancyChartData,
              labels: {
                chartOne: t("dashboardCards.unitsOccupied"),
                chartTwo: t("dashboardCards.unitsAvailable"),
              },
            }}
          />
        </CardContent>
        <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboardCards.highOccupancyMaintained")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("dashboardCards.unitsOccupiedVsAvailable")}
          </div>
        </CardFooter>
      </Card>

      {/* Total Rent Revenue Card */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>
            {t("dashboardCards.totalRentRevenue")}
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <SaCurrency /> 45,250.00
          </CardTitle>
        </CardHeader>
        <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboardCards.trendingUpThisMonth")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("dashboardCards.revenueIncreasedFromLastMonth")}
          </div>
        </CardFooter>
      </Card>

      {/* Total Costs Card */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>{t("dashboardCards.totalCosts")}</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl  font-semibold tabular-nums @[250px]/card:text-3xl">
            <SaCurrency /> 8,750
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -8.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboardCards.maintenanceCostsDecreased")}{" "}
            <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("dashboardCards.operationalCostsReduced")}
          </div>
        </CardFooter>
      </Card>

      {/* Total Amounts Collected Card */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>
            {t("dashboardCards.totalAmountsCollected")}
          </CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl  font-semibold tabular-nums @[250px]/card:text-3xl">
            <SaCurrency /> 38,420
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +9.7%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboardCards.steadyPerformanceIncrease")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("dashboardCards.totalCollectedAmountsThisMonth")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
