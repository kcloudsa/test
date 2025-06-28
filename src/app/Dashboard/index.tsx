import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "./data.json";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-4 md:gap-6 py-4 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6 ">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </main>
  );
}
