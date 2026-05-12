import { useEffect, useState } from "react"
import DashboardLayout from "./dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs"
import { useAuth } from "../auth-context"
import { API_BASE_URL } from "../lib/api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

export default function DashboardContent() {
  const { token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  console.log(data)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stats/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = await res.json()
        setData(result)
      } catch (err) {
        console.error("Failed to fetch dashboard summary:", err)
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchData()
  }, [token])

  const renderMetric = (label: any, total: any, monthly: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : total}
        </div>
        <p className="text-xs text-muted-foreground">
          +{loading ? "..." : monthly} this month
        </p>
      </CardContent>
    </Card>
  )

  const renderChart = (trendData: any[] | undefined, label: string) => {
    if (loading || !trendData) {
      return <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} name={label} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {renderMetric("Total Opportunities", data?.opportunities.total, data?.opportunities.thisMonth)}
          {renderMetric("Publications", data?.publications.total, data?.publications.thisMonth)}
          {renderMetric("Team Members", data?.team.total, data?.team.thisMonth)}
          {renderMetric("News & Events", data?.news.total, data?.news.thisMonth)}
        </div>

        <Tabs defaultValue="opportunities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="news">News & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Opportunities</CardTitle>
                <CardDescription>Latest job listings, consultancies, and calls for proposals.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderChart(data?.opportunities.trends, "Opportunities")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest Publications</CardTitle>
                <CardDescription>Recently added reports and documents.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderChart(data?.publications.trends, "Publications")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Add, remove, or update team members.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderChart(data?.team.trends, "Team Members")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>News & Events</CardTitle>
                <CardDescription>Updates on internal or external events and announcements.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderChart(data?.news.trends, "News")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
