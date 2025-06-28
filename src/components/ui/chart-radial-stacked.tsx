"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type ChartData = {
  month: string
  totalRents: number
  paidRents: number
  labels: {
    chartOne: string
    chartTwo: string
  }
}


interface ChartRadialStackedProps {
  chartData: ChartData
}

export function ChartRadialStacked({ chartData }: ChartRadialStackedProps) {
  const { totalRents, paidRents, month } = chartData
  const unpaidRents = totalRents - paidRents
  const paymentPercentage = Math.round((paidRents / totalRents) * 100)
  
  const chartConfig = {
    paidRents: {
      label: chartData.labels.chartOne,
      color: "var(--chart-1)",
    },
    unpaidRents: {
      label: chartData.labels.chartTwo,
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig
  // Prepare data for the chart
  const processedChartData = [{
    month,
    totalRents,
    paidRents,
    unpaidRents,
  }]

  return (
    <div className="h-[110px] overflow-hidden">
      <ChartContainer
        config={chartConfig}
        className="mx-auto w-full aspect-square max-w-[180px]"
      >
        <RadialBarChart
          data={processedChartData}
          startAngle={0}
          endAngle={180}
          innerRadius={80}
          outerRadius={130}
          width={250}
          height={130}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 16}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {paymentPercentage}%
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-muted-foreground text-sm"
                      >
                        {paidRents}/{totalRents}
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            dataKey="paidRents"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-paidRents)"
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="unpaidRents"
            fill="var(--color-unpaidRents)"
            stackId="a"
            cornerRadius={5}
            className="stroke-transparent stroke-2"
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  )
}