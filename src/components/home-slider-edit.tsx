import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "../hooks/use-toast"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Loader2, SaveIcon, FileIcon } from "lucide-react"
import { useAuth } from "../auth-context"

const HomeSliderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  primaryButtonText: z.string().optional(),
  primaryButtonLink: z.string().optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().optional(),
})

type HomeSliderFormData = z.infer<typeof HomeSliderSchema>

export default function EditHomeSliderPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<HomeSliderFormData>({
    resolver: zodResolver(HomeSliderSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      primaryButtonText: "",
      primaryButtonLink: "",
      secondaryButtonText: "",
      secondaryButtonLink: "",
      displayOrder: 1,
      isActive: true,
      imageUrl: "",
    },
  })

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await fetch(`https://forlandservice.onrender.com/slider/${id}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || "Failed to fetch home slider.")

        form.reset({
          title: data.title,
          subtitle: data.subtitle || "",
          primaryButtonText: data.primaryButtonText || "",
          primaryButtonLink: data.primaryButtonLink || "",
          secondaryButtonText: data.secondaryButtonText || "",
          secondaryButtonLink: data.secondaryButtonLink || "",
          displayOrder: data.displayOrder || 1,
          isActive: data.isActive !== false,
          imageUrl: data.backgroundImage || "",
        })

        if (data.backgroundImage) setImagePreview(data.backgroundImage)
      } catch (error) {
        console.error("Error fetching home slider:", error)
        toast({
          title: "❌ Error",
          description: "Failed to load home slider data.",
        })
      }
    }

    if (id) fetchSlider()
  }, [id, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data: HomeSliderFormData) => {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("subtitle", data.subtitle || "")
    formData.append("primaryButtonText", data.primaryButtonText || "")
    formData.append("primaryButtonLink", data.primaryButtonLink || "")
    formData.append("secondaryButtonText", data.secondaryButtonText || "")
    formData.append("secondaryButtonLink", data.secondaryButtonLink || "")
    formData.append("displayOrder", String(data.displayOrder || 1))
    formData.append("isActive", String(data.isActive !== false))

    if (imageFile) {
      formData.append("backgroundImage", imageFile)
    }

    try {
      const response = await fetch(`https://forlandservice.onrender.com/slider/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Home Slider Updated",
          description: "Your home slider was successfully updated.",
          action: (
            <button
              onClick={() => navigate("/home-slider")}
              className="text-blue-500 underline"
            >
              OK
            </button>
          ),
        })
        navigate("/home-slider")
      } else {
        toast({
          title: "⚠️ Error",
          description: result.message || "Failed to update home slider.",
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
              <CardTitle>Edit Home Slider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image upload with preview */}
              <div className="space-y-2">
                <Label htmlFor="image">Slider Image</Label>
                {imagePreview && (
                  <div className="mb-2">
                    <img
                      src={imagePreview}
                      alt="Slider preview"
                      className="h-48 w-full rounded-md border object-cover"
                    />
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imageFile && (
                  <p className="text-sm text-muted-foreground">
                    <FileIcon className="inline-block mr-1" />
                    {imageFile.name}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter slider title"
                  required
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  {...form.register("subtitle")}
                  placeholder="Enter slider subtitle (optional)"
                />
              </div>

              {/* Primary Button */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-sm">Primary Button</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryButtonText">Button Text</Label>
                    <Input
                      id="primaryButtonText"
                      {...form.register("primaryButtonText")}
                      placeholder="e.g., Learn More"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryButtonLink">Button Link</Label>
                    <Input
                      id="primaryButtonLink"
                      {...form.register("primaryButtonLink")}
                      placeholder="e.g., /about or https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Button */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-sm">Secondary Button</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonText">Button Text</Label>
                    <Input
                      id="secondaryButtonText"
                      {...form.register("secondaryButtonText")}
                      placeholder="e.g., Contact Us"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonLink">Button Link</Label>
                    <Input
                      id="secondaryButtonLink"
                      {...form.register("secondaryButtonLink")}
                      placeholder="e.g., /contact or https://example.com"
                    />
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
                    placeholder="1"
                    min="1"
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
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="font-normal">Active (visible on website)</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/home-slider")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Update Slider
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
