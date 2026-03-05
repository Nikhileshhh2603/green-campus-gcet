import DashboardLayout from '@/components/dashboard-layout';

export const metadata = {
  title: 'GCET Command Center - Admin Dashboard',
  description: 'Premium dark-mode admin dashboard for resource management',
};

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Overview</h1>
          <p className="text-foreground/60">Real-time monitoring of energy, water, and waste systems</p>
        </div>

        {/* Metric Cards Grid - CSS Grid Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric Card 1 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="h-24 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
              <p className="text-foreground/40 text-sm">Metric Card 1</p>
            </div>
          </div>

          {/* Metric Card 2 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="h-24 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
              <p className="text-foreground/40 text-sm">Metric Card 2</p>
            </div>
          </div>

          {/* Metric Card 3 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="h-24 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
              <p className="text-foreground/40 text-sm">Metric Card 3</p>
            </div>
          </div>

          {/* Metric Card 4 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="h-24 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
              <p className="text-foreground/40 text-sm">Metric Card 4</p>
            </div>
          </div>
        </div>

        {/* Charts Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1 - Full Height */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="h-80 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
              <p className="text-foreground/40 text-sm">Chart Placeholder 1</p>
            </div>
          </div>

          {/* Chart 2 - Full Height */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="h-80 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
              <p className="text-foreground/40 text-sm">Chart Placeholder 2</p>
            </div>
          </div>
        </div>

        {/* Wide Chart Section */}
        <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
          <div className="h-80 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
            <p className="text-foreground/40 text-sm">Wide Chart Placeholder</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
