import { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Capacity Analytics & Eviction Forecaster | Technocore Explorer V2",
  description:
    "Real-time saturation metrics, ring-buffer overwrite models, retention forecasting, and storage quota calculators.",
};

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnalyticsDashboard />
    </div>
  );
}
