"use client"

import { useEffect, useState, useRef } from "react"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useAuth } from "../auth-context"
import { PlusIcon, EditIcon, Trash2Icon, ImageIcon } from "lucide-react"
import { Skeleton } from "./ui/skeleton"

interface GalleryItem {
  _id: string
  title: string
  description: string
  category: {
    _id: string
    name: string
  }
  photos: string[]
  uploadedAt: string
}

interface Category {
  _id: string
  name: string
  description: string
  displayOrder: number
  isActive: boolean
}

export default function GalleryPage() {
  const { token } = useAuth()
  const [galleries, setGalleries] = useState<GalleryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("https://forlandservice.onrender.com/gallery-categories/?isActive=true")
      if (!res.ok) throw new Error("Failed to fetch categories")
      const data = await res.json()
      const categoryList = Array.isArray(data) ? data : (data.categories || data.data || [])
      setCategories(categoryList)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setCategories([])
    }
  }

  // Fetch galleries
  const fetchGalleries = async () => {
    try {
      setLoading(true)
      const res = await fetch("https://forlandservice.onrender.com/gallery/")
      if (!res.ok) throw new Error("Failed to fetch galleries")
      const data = await res.json()
      const galleryList = Array.isArray(data) ? data : (data.galleries || data.data || [])
      setGalleries(galleryList)
    } catch (err) {
      console.error("Error fetching galleries:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchGalleries()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // For new galleries: require title, category, and at least one photo
    // For existing galleries: require title and category, but photos are optional
    if (!title.trim() || !categoryId) {
      alert("Title and category are required")
      return
    }

    if (!editingId && files.length === 0) {
      alert("At least one photo is required for new galleries")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", categoryId)
      
      // Only append photos if there are any (for editing, this is optional)
      if (files.length > 0) {
        files.forEach((f) => formData.append("photos", f))
      }

      const url = editingId
        ? `https://forlandservice.onrender.com/gallery/${editingId}`
        : "https://forlandservice.onrender.com/gallery/"

      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save gallery")
      }

      await fetchGalleries()
      resetForm()
      setOpenDialog(false)
    } catch (err) {
      console.error("Error saving gallery:", err)
      alert(err instanceof Error ? err.message : "Error saving gallery")
    } finally {
      setUploading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gallery?")) {
      return
    }

    try {
      const res = await fetch(`https://forlandservice.onrender.com/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete gallery")
      }

      await fetchGalleries()
    } catch (err) {
      console.error("Error deleting gallery:", err)
      alert(err instanceof Error ? err.message : "Error deleting gallery")
    }
  }

  // Reset form
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategoryId("")
    setFiles([])
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Handle edit
  const handleEdit = (gallery: GalleryItem) => {
    setTitle(gallery.title || "")
    setDescription(gallery.description || "")
    setCategoryId(gallery.category && gallery.category._id ? gallery.category._id : "")
    setEditingId(gallery._id)
    setOpenDialog(true)
  }

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setOpenDialog(open)
    if (!open) {
      resetForm()
    }
  }

  // Remove file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
            <p className="text-muted-foreground">Upload and manage photo galleries</p>
          </div>
          <Dialog open={openDialog} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!categories || categories.length === 0}>
                <PlusIcon className="h-4 w-4" />
                Upload Gallery
              </Button>
            </DialogTrigger>
            {categories && categories.length > 0 ? (
              <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Gallery" : "Upload New Gallery"}</DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Update the gallery details below."
                      : "Add a new photo gallery with the details below. You can upload up to 10 photos."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="gal-title">Gallery Title *</Label>
                    <Input
                      id="gal-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., FORLAND Field Visit 2026"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="gal-desc">Description</Label>
                    <Textarea
                      id="gal-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description of the gallery"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gal-category">Category *</Label>
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                      <SelectTrigger id="gal-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(categories) && categories.length > 0 ? (
                          categories.map((cat) => {
                            if (!cat || !cat._id || !cat.name) return null
                            return (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            )
                          })
                        ) : (
                          <SelectItem value="" disabled>No categories available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                <div>
                  <Label htmlFor="gal-photos">
                    Photos (up to 10) {editingId ? "(optional - add new photos)" : "*"}
                  </Label>
                  <Input
                    ref={fileInputRef}
                    id="gal-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const selected = Array.from(e.target.files || [])
                      if (selected.length + files.length > 10) {
                        alert("Maximum 10 photos allowed")
                        return
                      }
                      setFiles((prev) => [...prev, ...selected])
                    }}
                  />
                  {files.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">Selected photos ({files.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {files.map((f, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={URL.createObjectURL(f)}
                              alt={f.name}
                              className="h-20 w-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="text-xs">✕</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : editingId ? "Update" : "Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
            ) : (
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>No Categories Available</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Please create at least one gallery category before uploading galleries. Go to Gallery Categories to create one.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </div>

        {/* Galleries Grid/Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Galleries</CardTitle>
            <CardDescription>Manage your photo galleries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : galleries.length === 0 ? (
              <div className="py-8 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No galleries yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {galleries.map((gallery) => {
                  // Safety check for gallery structure
                  if (!gallery || !gallery._id) return null
                  
                  return (
                    <Card key={gallery._id} className="overflow-hidden">
                      <div className="bg-slate-200 h-32 overflow-hidden relative">
                        {gallery.photos && gallery.photos.length > 0 ? (
                          <img
                            src={gallery.photos[0]}
                            alt={gallery.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            {gallery.photos ? gallery.photos.length : 0} photos
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm truncate">{gallery.title || "Untitled"}</h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{gallery.description || ""}</p>
                        <p className="text-xs text-blue-600 font-medium mb-3">
                          {gallery.category && gallery.category.name ? gallery.category.name : "Uncategorized"}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={() => handleEdit(gallery)}
                          >
                            <EditIcon className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 h-8 text-xs"
                            onClick={() => handleDelete(gallery._id)}
                          >
                            <Trash2Icon className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
