import prisma from "@/lib/prisma";
import FinanceChart from "./FinanceChart";

const FinanceChartContainer = async () => {
  const currentYear = new Date().getFullYear();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  let data = [];

  try {
    // Get fee data for the current year
    const fees = await prisma.fee.findMany({
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData = months.map((month, index) => {
      const monthFees = fees.filter(
        (fee) => fee.createdAt.getMonth() === index
      );

      const income = monthFees
        .filter((fee) => fee.status === "PAID")
        .reduce((sum, fee) => sum + fee.amount, 0);

      const expense = monthFees
        .filter((fee) => fee.status === "UNPAID" || fee.status === "OVERDUE")
        .reduce((sum, fee) => sum + fee.amount, 0);

      return {
        name: month,
        income: Math.round(income),
        expense: Math.round(expense),
      };
    });

    data = monthlyData;
  } catch (error) {
    console.log("Database error, using demo data:", error);
    // Fallback demo data if database fails
    data = [
      { name: "Jan", income: 4000, expense: 2400 },
      { name: "Feb", income: 3000, expense: 1398 },
      { name: "Mar", income: 2000, expense: 9800 },
      { name: "Apr", income: 2780, expense: 3908 },
      { name: "May", income: 1890, expense: 4800 },
      { name: "Jun", income: 2390, expense: 3800 },
      { name: "Jul", income: 3490, expense: 4300 },
      { name: "Aug", income: 3490, expense: 4300 },
      { name: "Sep", income: 3490, expense: 4300 },
      { name: "Oct", income: 3490, expense: 4300 },
      { name: "Nov", income: 3490, expense: 4300 },
      { name: "Dec", income: 3490, expense: 4300 },
    ];
  }

  return <FinanceChart data={data} />;
};

export default FinanceChartContainer;
