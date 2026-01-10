"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useAuth } from "../auth-context"
import { Upload } from "lucide-react"
import DashboardLayout from "./dashboard-layout"
import { toast } from "../hooks/use-toast"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Input } from "./ui/input"

export default function BannersNewPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [title, setTitle] = useState("")

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

    if (!image) {
      toast({
        title: "⚠️ Error",
        description: "Please select an image",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "⚠️ Error",
        description: "Please enter a title",
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("image", image)
      formData.append("isActive", String(isActive))
      formData.append("title", title)

      const response = await fetch("https://forlandservice.onrender.com/banners", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "🎉 Banner Created",
          description: "Your banner was successfully created.",
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
          description: error.message || "Failed to create banner",
        })
      }
    } catch (error) {
      console.error("Error creating banner:", error)
      toast({
        title: "❌ Error",
        description: "An error occurred while creating the banner",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Banner</h1>
          <p className="text-muted-foreground">Upload a new banner image</p>
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
                    required
                  />
                  <label htmlFor="banner-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload banner image</span>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <img src={imagePreview} alt="Banner preview" className="w-full h-48 object-cover rounded-lg" />
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
                  disabled={uploading || !image}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? "Creating..." : "Create Banner"}
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
