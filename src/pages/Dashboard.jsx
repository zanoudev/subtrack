import { useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

const Dashboard = () => {

  // Mock Data (Replace with Firestore data)
  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Total Revenue ($)",
        data: [500, 800, 1200, 1500, 2000],
        backgroundColor: "rgba(50, 85, 241, 0.6)",
      },
    ],
  };

  const subscriberData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Subscribers Count",
        data: [20, 35, 50, 75, 100],
        fill: false,
        borderColor: "#3255f1",
        tension: 0.4,
      },
    ],
  };

  // Mock Data for Doughnut Charts
  const revenueByPlan = {
    labels: ["Plan A", "Plan B", "Plan C"],
    datasets: [
      {
        data: [5000, 3000, 2000],
        backgroundColor: ["#3255f1", "#FF6384", "#36A2EB"],
      },
    ],
  };

  const subscribersByPlan = {
    labels: ["Plan A", "Plan B", "Plan C"],
    datasets: [
      {
        data: [150, 100, 50],
        backgroundColor: ["#3255f1", "#FF6384", "#36A2EB"],
      },
    ],
  };

  const revenueByDuration = {
    labels: ["Monthly Plans", "Yearly Plans"],
    datasets: [
      {
        data: [7000, 3000],
        backgroundColor: ["#3255f1", "#FFCE56"],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col items-start px-10 py-16">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-5xl font-bold">Dashboard</h1>
      </div>
      {/* Revenue & Subscribers Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Revenue - Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Total Revenue</h2>
          <div className="h-[300px]">
            <Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Subscriber Count - Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Subscribers Count</h2>
          <div className="h-[300px]">
            <Line data={subscriberData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Doughnut Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  {/* Revenue Breakdown by Plan */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
    <h2 className="text-xl font-semibold mb-4 text-center">Revenue Breakdown by Plan</h2>
    <div className="w-full max-w-xs aspect-[1/1]">
      <Doughnut data={revenueByPlan} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  </div>

  {/* Subscriber Distribution by Plan */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
    <h2 className="text-xl font-semibold mb-4 text-center">Subscriber Distribution</h2>
    <div className="w-full max-w-xs aspect-[1/1]">
      <Doughnut data={subscribersByPlan} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  </div>

  {/* Revenue Breakdown by Subscription Duration */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
    <h2 className="text-xl font-semibold mb-4 text-center">Revenue by Subscription Duration</h2>
    <div className="w-full max-w-xs aspect-[1/1]">
      <Doughnut data={revenueByDuration} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  </div>
</div>

    </div>
  );
};

export default Dashboard;
