import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "../hooks/use-toast"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
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
import { CalendarIcon, Loader2, SaveIcon, FileIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"
import { cn } from "../lib/utils"
import { useAuth } from "../auth-context"

const PublicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  contentDescription: z.string().min(1, "Content description is required"),
  publicationDate: z.date().optional(),
  imageUrl: z.string().optional(),
})

type PublicationFormData = z.infer<typeof PublicationSchema>

export default function EditPublicationPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PublicationFormData>({
    resolver: zodResolver(PublicationSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      contentDescription: "",
      publicationDate: undefined,
      imageUrl: "",
    },
  })

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await fetch(`https://forlandservice.onrender.com/publications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || "Failed to fetch publication.")

        form.reset({
          title: data.title,
          category: data.category,
          description: data.description,
          contentDescription: data.contentDescription,
          publicationDate: data.publicationDate ? new Date(data.publicationDate) : undefined,
          imageUrl: data.photo || "",
        })

        if (data.publicationDate) setDate(new Date(data.publicationDate))
        if (data.photo) setImagePreview(data.photo)
        if (data.document) setDocumentPreview(data.document) // Fetch document preview
      } catch (error) {
        console.error("Error fetching publication:", error)
        toast({
          title: "❌ Error",
          description: "Failed to load publication data.",
        })
      }
    }

    if (id) fetchPublication()
  }, [id, token, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentFile(file)
      setDocumentPreview(file.name)
    }
  }

  const onSubmit = async (data: PublicationFormData) => {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("category", data.category)
    formData.append("description", data.description)
    formData.append("newsAndEvents", data.description)
    formData.append("publicationDate", date?.toISOString() || "")
    formData.append("contentDescription", data.contentDescription)

    if (imageFile) {
      formData.append("photo", imageFile)
    }
    if (documentFile) {
      formData.append("document", documentFile)
    }

    try {
      const response = await fetch(`https://forlandservice.onrender.com/publications/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Publication Updated",
          description: "The publication was successfully updated.",
          action: (
            <button
              onClick={() => navigate("/publications")}
              className="text-blue-500 underline"
            >
              OK
            </button>
          ),
        })
      } else {
        toast({
          title: "⚠️ Error",
          description: result.message || "Failed to update publication.",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Something went wrong while submitting the form.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter publication title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    {...form.register("category")}
                    onValueChange={(value) => form.setValue("category", value)}
                    defaultValue={form.getValues("category")}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pfp">PFP Technical Reports</SelectItem>
                      <SelectItem value="pfp-administrative-and-management">PFP Administrative & Management Reports</SelectItem>
                      <SelectItem value="forvac-technical">FORVAC Technical Reports</SelectItem>
                      <SelectItem value="forvac-administrative-and-management">FORVAC Administrative & Management Reports</SelectItem>
                      <SelectItem value="forland-admin">FORLAND - Admin & Financial Reports</SelectItem>
                      <SelectItem value="forland-technical">FORLAND - Project Technical Report</SelectItem>
                      <SelectItem value="forland-forms">FORLAND - Forms and Guidelines</SelectItem>
                      <SelectItem value="forland-brochure">FORLAND - Brochure & Newsletters</SelectItem>
                      <SelectItem value="forland-institutional">FORLAND - Institutional Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Publication Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
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
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Write a description of this publication..."
                  className="w-full p-2 border rounded-md"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentDescription">Markdown Content</Label>
                <MarkdownEditor
                  value={form.watch("contentDescription")}
                  onChange={(value) => form.setValue("contentDescription", value)}
                  placeholder="Write markdown content for this publication..."
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Cover Image</Label>
                {imagePreview && (
                  <img src={imagePreview} alt="Current" className="max-w-xs rounded-md shadow" />
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                {documentPreview && (
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
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/dashboard/publications")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Changes
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
