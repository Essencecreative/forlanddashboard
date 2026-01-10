import DashboardLayout from "./dashboard-layout"
import HomeSliderTable from "./home-slider-table"

export default function HomeSliderPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Home Slider</h1>
          <p className="text-muted-foreground">
            Manage hero sliders for your homepage.
          </p>
        </div>
        <HomeSliderTable />
      </div>
    </DashboardLayout>
  )
}
