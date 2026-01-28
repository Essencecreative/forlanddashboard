import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { MarkdownEditor } from "./ui/markdown-editor"
import { CalendarIcon, SaveIcon, FileIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"
import { cn } from "../lib/utils"
import { toast } from "../hooks/use-toast"
import { useAuth } from "../auth-context"

export default function EditNewsEventPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>()
  const [eventStartDate, setEventStartDate] = useState<Date>()
  const [eventEndDate, setEventEndDate] = useState<Date>()
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEvent = category === "Events and Trainings"
  const isGallery = category === "Photo Gallery"

  useEffect(() => {
    if (!id || !token) return

    const fetchNewsEvent = async () => {
      try {
        const res = await fetch(`https://forlandservice.onrender.com/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to fetch news/event.")

        setTitle(data.title || "")
        setCategory(data.category || "")
        setDate(data.publicationDate ? new Date(data.publicationDate) : undefined)
        setEventStartDate(data.eventStartDate ? new Date(data.eventStartDate) : undefined)
        setEventEndDate(data.eventEndDate ? new Date(data.eventEndDate) : undefined)
        setDescription(data.description || "")
        setContent(data.contentDescription || "")
        setPhotoPreview(data.photo || null)
        setDocumentPreview(data.documentUrl || null)
      } catch (err) {
        console.error("Fetch error:", err)
        toast({
                 title: "⚠️ Error",
                 description: "Failed to Edit news.",
               })
      }
    }

    fetchNewsEvent()
  }, [id, token])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentFile(file)
      setDocumentPreview(file.name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.type !== "textarea") {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("category", category)
    formData.append("publicationDate", date?.toISOString() || "")
    formData.append("description", description)
    formData.append("contentDescription", content)
    if (eventStartDate) formData.append("eventStartDate", eventStartDate.toISOString())
    if (eventEndDate) formData.append("eventEndDate", eventEndDate.toISOString())
    if (photo) formData.append("photo", photo)
    if (documentFile) formData.append("document", documentFile)

    try {
      const response = await fetch(`https://forlandservice.onrender.com/news/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to update news/event")
        toast({
          title: "🎉 News Edited",
          description: "Your News was successfully Edited.",
          action: (
            <button
              onClick={() => navigate("/news")}
              className="text-blue-500 underline"
            >
              OK
            </button>
          ),
        })
      navigate("/news-and-events")
    } catch (err) {
      console.error(err)
       toast({
                title: "⚠️ Error",
                description: "Something went wrong. Please try again.",
              })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit News/Event</h1>
          <p className="text-muted-foreground">
            Update the content and details of this news or event.
          </p>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Media News">Media News</SelectItem>
                      <SelectItem value="General News">General News</SelectItem>
                      <SelectItem value="Events and Trainings">Events and Trainings</SelectItem>
                      <SelectItem value="Radio Programmes">Radio Programmes</SelectItem>
                      <SelectItem value="Photo Gallery">Photo Gallery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Publication Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
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

              {isEvent && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Event Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventStartDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventStartDate ? format(eventStartDate, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={eventStartDate} onSelect={setEventStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Event End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventEndDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventEndDate ? format(eventEndDate, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={eventEndDate} onSelect={setEventEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {!isGallery && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="photo">Image</Label>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Selected"
                    className="w-48 h-auto rounded border border-muted shadow"
                  />
                )}
                <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                {documentPreview && !documentFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileIcon className="w-4 h-4" />
                    <a href={documentPreview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Current Document
                    </a>
                  </div>
                )}
                {documentFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileIcon className="w-4 h-4" />
                    <span>{documentPreview}</span>
                  </div>
                )}
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleDocumentChange}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/dashboard/news-events")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : <><SaveIcon className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
