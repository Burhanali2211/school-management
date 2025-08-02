import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  let boys = 0;
  let girls = 0;
  
  try {
    const data = await prisma.student.groupBy({
      by: ["sex"],
      _count: true,
    });

    boys = data.find((d) => d.sex === "MALE")?._count || 0;
    girls = data.find((d) => d.sex === "FEMALE")?._count || 0;
  } catch (error) {
    console.error("Database error:", error);
  }

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* CHART */}
      <CountChart boys={boys} girls={girls} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-primary-400 rounded-full" />
          <h1 className="font-bold">{boys}</h1>
          <h2 className="text-xs text-neutral-500">
            Boys ({Math.round((boys / (boys + girls)) * 100)}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-accent-400 rounded-full" />
          <h1 className="font-bold">{girls}</h1>
          <h2 className="text-xs text-neutral-500">
            Girls ({Math.round((girls / (boys + girls)) * 100)}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
