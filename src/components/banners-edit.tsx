"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { Upload } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../auth-context"
import DashboardLayout from "./dashboard-layout"
import { toast } from "../hooks/use-toast"

interface Banner {
  _id: string
  title: string
  image: string
  isActive: boolean
}

export default function BannersEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [currentImage, setCurrentImage] = useState<string>("")
  const [updating, setUpdating] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [title, setTitle] = useState("")

  useEffect(() => {
    if (id) {
      fetchBanner(id)
    }
  }, [id])

  const fetchBanner = async (bannerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://forlandservice.onrender.com/banners/${bannerId}`)

      if (response.ok) {
        const data: Banner = await response.json()
        setTitle(data.title)
        setCurrentImage(data.image)
        setImagePreview(data.image)
        setIsActive(data.isActive)
      } else {
        toast({
          title: "❌ Error",
          description: "Failed to load banner",
        })
        navigate("/banners")
      }
    } catch (error) {
      console.error("Error fetching banner:", error)
      toast({
        title: "❌ Error",
        description: "An error occurred while loading the banner",
      })
      navigate("/banners")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id) return

    try {
      setUpdating(true)
      const formData = new FormData()
      formData.append("isActive", String(isActive))
      formData.append("title", title)

      if (image) {
        formData.append("image", image)
      }

      const response = await fetch(`https://forlandservice.onrender.com/banners/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "🎉 Banner Updated",
          description: "Your banner was successfully updated.",
          action: (
            <button
              onClick={() => navigate("/banners")}
              className="text-blue-500 underline"
            >
              OK
            </button>
          ),
        })
        navigate("/banners")
      } else {
        const error = await response.json()
        toast({
          title: "⚠️ Error",
          description: error.message || "Failed to update banner",
        })
      }
    } catch (error) {
      console.error("Error updating banner:", error)
      toast({
        title: "❌ Error",
        description: "An error occurred while updating the banner",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Banner</h1>
          <p className="text-muted-foreground">Update the banner image</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Banner Title</Label>
                <Input
                  id="title"
                  placeholder="Enter banner title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="banner-input"
                  />
                  <label htmlFor="banner-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload new banner image</span>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Current Banner:</p>
                    <img src={imagePreview} alt="Banner preview" className="w-full h-48 object-cover rounded-lg" />
                    {image && <p className="text-xs text-gray-500 mt-2">New image selected</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive" 
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                  Make this banner active
                </Label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updating ? "Updating..." : "Update Banner"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/banners")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
