import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { FileIcon, SaveIcon } from "lucide-react"
import { API_BASE_URL } from "../lib/api";

export default function NewOpportunityPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState("job") // "job" or "proposal"
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
  
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    if (file) {
      formData.append("document", file)
    }
  
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities`, {
        method: "POST",
        body: formData,
      })
  
      if (!res.ok) throw new Error("Failed to submit opportunity")
  
      setIsSubmitting(false)
      navigate("/opportunities")
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      alert("Something went wrong while posting.")
    }
  }
  

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Opportunity</h1>
          <p className="text-muted-foreground">Create a new opportunity listing, such as a job vacancy or call for proposals.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter opportunity title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full border rounded px-3 py-2 bg-background"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="job">Job Vacancy</option>
                <option value="proposal">Call for Proposal</option>
              </select>
            </div>


              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the opportunity..."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload Document (PDF, DOCX)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <FileIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/dashboard/opportunities")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Posting...</>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Post Opportunity
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
