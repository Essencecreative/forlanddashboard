import { useState } from "react"
import { useNavigate } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "../hooks/use-toast"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Loader2, SaveIcon } from "lucide-react"
import { useAuth } from "../auth-context"

const YouTubeVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  youtubeUrl: z.string().url("Must be a valid URL").min(1, "YouTube URL is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().min(1, "Button link is required"),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

type YouTubeVideoFormData = z.infer<typeof YouTubeVideoSchema>

export default function NewYouTubeVideoPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const form = useForm<YouTubeVideoFormData>({
    resolver: zodResolver(YouTubeVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      youtubeUrl: "",
      buttonText: "",
      buttonLink: "",
      displayOrder: 0,
      isActive: true,
    },
  })

  const onSubmit = async (data: YouTubeVideoFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("https://forlandservice.onrender.com/youtube/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          youtubeUrl: data.youtubeUrl,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          displayOrder: data.displayOrder || 0,
          isActive: data.isActive !== false,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "🎉 YouTube Video Created",
          description: "Your YouTube video was successfully created.",
          action: (
            <button
              onClick={() => navigate("/youtube-videos")}
              className="text-blue-500 underline"
            >
              OK
            </button>
          ),
        })
        navigate("/youtube-videos")
      } else {
        toast({
          title: "⚠️ Error",
          description: result.message || "Failed to create YouTube video.",
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
              <CardTitle>New YouTube Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter video title"
                  required
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Enter video description"
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  required
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* YouTube URL */}
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  {...form.register("youtubeUrl")}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  required
                />
                {form.formState.errors.youtubeUrl && (
                  <p className="text-sm text-red-500">{form.formState.errors.youtubeUrl.message}</p>
                )}
              </div>

              {/* Button Text & Link */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-sm">Call-to-Action Button</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      {...form.register("buttonText")}
                      placeholder="e.g., Watch Full Documentary"
                      required
                    />
                    {form.formState.errors.buttonText && (
                      <p className="text-sm text-red-500">{form.formState.errors.buttonText.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buttonLink">Button Link</Label>
                    <Input
                      id="buttonLink"
                      {...form.register("buttonLink")}
                      placeholder="e.g., /documentaries or https://example.com"
                      required
                    />
                    {form.formState.errors.buttonLink && (
                      <p className="text-sm text-red-500">{form.formState.errors.buttonLink.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Display Order & Active Status */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    {...form.register("displayOrder", { valueAsNumber: true })}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      {...form.register("isActive")}
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="font-normal">Active (visible on website)</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/youtube-videos")}>
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
                    Save Video
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
