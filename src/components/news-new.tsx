import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { MarkdownEditor } from "./ui/markdown-editor"
import { CalendarIcon, ImageIcon, SaveIcon, FileIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"
import { cn } from "../lib/utils"
import { toast } from "sonner"
import { useAuth } from "../auth-context"

export default function NewNewsEventPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date>()
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData()
    const title = (form.elements.namedItem("title") as HTMLInputElement).value

    formData.append("title", title)
    formData.append("category", category)
    formData.append("publicationDate", date?.toISOString() || "")
    formData.append("description", description)
    formData.append("newsAndEvents", description)
    formData.append("contentDescription", content)

    if (imageFile) {
      formData.append("photo", imageFile)
    }
    
    if (documentFile) {
      formData.append("document", documentFile)
    }

    try {
      const response = await fetch("https://forlandservice.onrender.com/news", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to create news/update")

      toast.success("News/Update created successfully!")
      navigate("/news-and-events")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isGallery = category === "Photo Gallery"

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New News/Event</h1>
          <p className="text-muted-foreground">Create a new news article, event, or media content.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter title" required />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Media News">Media News</SelectItem>
                      <SelectItem value="General News">General News</SelectItem>
                      <SelectItem value="Events and Trainings">Events and Trainings</SelectItem>
                      <SelectItem value="Radio Programmes">Radio Programmes</SelectItem>
                      <SelectItem value="Institutional Support">Radio Programmes</SelectItem>
                      <SelectItem value="Photo Gallery">Photo Gallery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Publication Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Upload Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setImageFile(file)
                    }}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                />
                {documentFile && (
                  <p className="text-sm text-muted-foreground">
                    <FileIcon className="inline-block mr-1" />
                    {documentFile.name}
                  </p>
                )}
              </div>

              {!isGallery && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a short summary of the content"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <MarkdownEditor value={content} onChange={setContent} placeholder="Write your content here..." />
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/dashboard/news-events")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save {category || "Content"}
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
