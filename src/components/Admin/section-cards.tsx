import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
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
import SaCurrency from "@/common/sa-currency";

// Example admin data (replace with real API data in production)
const adminStats = {
  netIncome: {
    current: 81250,
    change: 0.182,
    improved: true,
  },
  totalCosts: {
    value: 87500,
    change: -0.083,
    improved: false,
  },
  totalCollected: {
    value: 384200,
    change: 0.097,
    improved: true,
  },
};

export function SectionCards() {
  const { t } = useTranslation("charts");

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      {/* Net Income Ratio Card */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>
            {t("dashboardCards.netIncomeRatio")}
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {adminStats.netIncome.improved ? "+" : ""}
              {(adminStats.netIncome.change * 100).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <SaCurrency /> {adminStats.netIncome.current.toLocaleString()}
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {adminStats.netIncome.improved
              ? t("dashboardCards.netIncomeIncreased")
              : t("dashboardCards.netIncomeDecreased")}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("dashboardCards.profitMarginImproved")}
          </div>
        </CardFooter>
      </Card>

      {/* Total Costs Card */}
      <Card className="@container/card flex flex-col">
        <CardHeader>
          <CardDescription>{t("dashboardCards.totalCosts")}</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl  font-semibold tabular-nums @[250px]/card:text-3xl">
            <SaCurrency /> {adminStats.totalCosts.value.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {(adminStats.totalCosts.change * 100).toFixed(1)}%
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
            <SaCurrency /> {adminStats.totalCollected.value.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {adminStats.totalCollected.improved ? "+" : ""}
              {(adminStats.totalCollected.change * 100).toFixed(1)}%
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
