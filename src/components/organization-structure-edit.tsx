"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { useAuth } from "../auth-context"
import { Switch } from "./ui/switch"
import { Skeleton } from "./ui/skeleton"
import { Upload } from "lucide-react"
import DashboardLayout from "./dashboard-layout"
import { toast } from "../hooks/use-toast"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface OrganizationStructure {
  _id: string
  title: string
  description?: string
  isActive: boolean
  banner?: string
}

export default function OrganizationStructureEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [banner, setBanner] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string>("")
  const [currentBanner, setCurrentBanner] = useState<string>("")
  const [updating, setUpdating] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (id) {
      fetchStructure(id)
    }
  }, [id])

  const fetchStructure = async (structureId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://forlandservice.onrender.com/organization-structure/${structureId}`)

      if (response.ok) {
        const data: OrganizationStructure = await response.json()
        form.reset({
          title: data.title,
          description: data.description || "",
          isActive: data.isActive,
        })
        if (data.banner) {
          setCurrentBanner(data.banner)
          setBannerPreview(data.banner)
        }
      } else {
        alert("Failed to load organization structure")
        navigate("/organization-structure")
      }
    } catch (error) {
      console.error("Error fetching organization structure:", error)
      alert("An error occurred while loading the organization structure")
      navigate("/organization-structure")
    } finally {
      setLoading(false)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBanner(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!id) return

    try {
      setUpdating(true)
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("isActive", String(data.isActive))

      if (banner) {
        formData.append("banner", banner)
      }

      const response = await fetch(`https://forlandservice.onrender.com/organization-structure/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "🎉 Organization Structure Updated",
          description: "Your organization structure was successfully updated.",
          action: (
            <button
              onClick={() => navigate("/organization-structure")}
              className="text-blue-500 underline"
            >
              OK
            </button>
          ),
        })
        navigate("/organization-structure")
      } else {
        const error = await response.json()
        toast({
          title: "⚠️ Error",
          description: error.message || "Failed to update organization structure",
        })
      }
    } catch (error) {
      console.error("Error updating organization structure:", error)
      toast({
        title: "❌ Error",
        description: "An error occurred while updating the organization structure",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Organization Structure</h1>
          <p className="text-muted-foreground">Update the organization structure details</p>
        </div>

        <Card>
        <CardHeader>
          <CardTitle>Organization Structure Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization structure title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Banner Image</FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="banner-input"
                  />
                  <label htmlFor="banner-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload new banner image</span>
                  </label>
                </div>
                {bannerPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Current Banner:</p>
                    <img src={bannerPreview} alt="Banner preview" className="h-32 w-full object-cover rounded-lg" />
                    {banner && <p className="text-xs text-gray-500 mt-2">New image selected</p>}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Make this organization structure visible</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updating ? "Updating..." : "Update Organization Structure"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/organization-structure")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
