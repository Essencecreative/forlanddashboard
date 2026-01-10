import DashboardLayout from "./dashboard-layout"
import YouTubeVideosTable from "./youtube-videos-table"

export default function YouTubeVideosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">YouTube Videos</h1>
          <p className="text-muted-foreground">
            Manage YouTube video links for your website.
          </p>
        </div>
        <YouTubeVideosTable />
      </div>
    </DashboardLayout>
  )
}
