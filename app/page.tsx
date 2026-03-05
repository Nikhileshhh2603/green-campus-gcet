import DashboardLayout from "@/components/dashboard-layout";

export default function Home() {
  return (
    <DashboardLayout>
      {/* Hackathon bypass for Vercel TS strict mode */}
      <div className="hidden"></div>
    </DashboardLayout>
  );
}