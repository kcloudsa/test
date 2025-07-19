import { ChartAreaInteractive } from "@/components/Admin/chart-area-interactive";
import { SectionCards } from "@/components/Admin/section-cards";

export default function Dashboard() {

  return (
    <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </main>
  );
}
