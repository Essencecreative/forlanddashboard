// src/components/NewsEventsTable.tsx
import { useEffect, useState, useRef } from "react"
import { Link, useSearchParams } from "react-router"
import {
  ArrowDownIcon, ArrowUpIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon,
  ExternalLinkIcon, ImageIcon, MicIcon, NewspaperIcon, RadioIcon,
  SearchIcon, UsersIcon, PlusIcon, EditIcon, Trash2Icon, XIcon
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../auth-context"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle,
  DialogDescription
} from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Media News", label: "Media News" },
  { value: "General News", label: "General News" },
  { value: "Events and Trainings", label: "Events and Trainings" },
  { value: "Radio Programmes", label: "Radio Programmes" },
  { value: "Photo Gallery", label: "Photo Gallery" },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Media News": return <NewspaperIcon className="h-4 w-4 text-blue-500" />
    case "General News": return <NewspaperIcon className="h-4 w-4 text-gray-500" />
    case "Events and Trainings": return <UsersIcon className="h-4 w-4 text-green-500" />
    case "Radio Programmes": return <RadioIcon className="h-4 w-4 text-purple-500" />
    case "Photo Gallery": return <ImageIcon className="h-4 w-4 text-amber-500" />
    default: return <NewspaperIcon className="h-4 w-4" />
  }
}

const getCategoryVariant = (category: string): "default" | "outline" | "secondary" | "destructive" => {
  switch (category) {
    case "Media News": return "default"
    case "General News": return "secondary"
    case "Events and Trainings": return "outline"
    case "Radio Programmes": return "destructive"
    case "Photo Gallery": return "secondary"
    default: return "default"
  }
}

/* ---------- GALLERY UPLOADER ---------- */
const GalleryUploader = ({
  onSuccess,
}: {
  onSuccess: () => void
}) => {
  const { token } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || files.length === 0) return

    setUploading(true)
    const form = new FormData()
    form.append("title", title)
    form.append("description", description)
    files.forEach(f => form.append("photos", f))

    try {
      const res = await fetch("https://forlandservice.onrender.com/gallery", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error("Upload failed")
      setTitle("")
      setDescription("")
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ""
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Add New Gallery</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="g-title">Title</Label>
          <Input
            id="g-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Summer Camp 2025"
            required
          />
        </div>

        <div>
          <Label htmlFor="g-desc">Description (optional)</Label>
          <Textarea
            id="g-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description of the gallery"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="g-photos">Photos (up to 10)</Label>
          <Input
            ref={fileInputRef}
            id="g-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={e => {
              const selected = Array.from(e.target.files || [])
              if (selected.length + files.length > 10) {
                alert("Maximum 10 photos allowed")
                return
              }
              setFiles(prev => [...prev, ...selected])
            }}
          />
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={uploading || !title || files.length === 0}>
          {uploading ? "Uploading…" : "Upload Gallery"}
        </Button>
      </form>
    </Card>
  )
}

/* ---------- MAIN COMPONENT ---------- */
export default function NewsEventsTable() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const urlCategory = searchParams.get("category")?.trim() || "all"

  // ----- COMMON STATES -----
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(urlCategory)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // ----- DATA STATES -----
  const [newsItems, setNewsItems] = useState<any[]>([])          // normal publications
  const [galleryItems, setGalleryItems] = useState<any[]>([])    // galleries

  const itemsPerPage = 5

  // ----- FETCH LOGIC -----
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 1. Normal publications (always fetch, we filter later)
      try {
        const res = await fetch(
          `https://forlandservice.onrender.com/news?page=${currentPage}&limit=${itemsPerPage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        setNewsItems(data.news || [])
        setTotalPages(data.totalPages || 1)
      } catch (e) { console.error(e) }

      // 2. Gallery items (only when we are in gallery mode)
      if (selectedCategory === "Photo Gallery") {
        try {
          const res = await fetch(
            `https://forlandservice.onrender.com/gallery?page=${currentPage}&limit=${itemsPerPage}`
          )
          const data = await res.json()
          setGalleryItems(data.galleries || [])
          setTotalPages(data.totalPages || 1)
        } catch (e) { console.error(e) }
      }

      setLoading(false)
    }

    fetchData()
  }, [token, currentPage, selectedCategory])

  // ----- FILTERED LIST -----
  const filteredNews = newsItems.filter((item: any) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredGalleries = galleryItems.filter((g: any) => {
    const matchesSearch =
      g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const displayItems = selectedCategory === "Photo Gallery" ? filteredGalleries : filteredNews

  // ----- DELETE HANDLERS -----
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (id: string, isGallery: boolean) => {
    setDeleting(true)
    const endpoint = isGallery
      ? `https://forlandservice.onrender.com/gallery/${id}`
      : `https://forlandservice.onrender.com/news/${id}`

    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Delete failed")
      if (isGallery) {
        setGalleryItems(prev => prev.filter(i => i._id !== id))
      } else {
        setNewsItems(prev => prev.filter(i => i._id !== id))
      }
      setDeleteId(null)
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  // ----- GALLERY PREVIEW DIALOG -----
  const [previewGallery, setPreviewGallery] = useState<any>(null)

  return (
    <div className="space-y-4">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Add button – only for non-gallery or gallery uploader */}
          {selectedCategory !== "Photo Gallery" ? (
            <Button asChild>
              <Link to="/newsnew">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add News
              </Link>
            </Button>
          ) : null}
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ---------- GALLERY UPLOADER (only when category=gallery) ---------- */}
      {selectedCategory === "Photo Gallery" && (
        <GalleryUploader onSuccess={() => setCurrentPage(1)} />
      )}

      {/* ---------- TABLE ---------- */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Title</TableHead>
                <TableHead className="w-[15%]">Date</TableHead>
                <TableHead className="w-[15%]">Category</TableHead>
                <TableHead className="w-[25%]">
                  {selectedCategory === "Photo Gallery" ? "Photos" : "Description"}
                </TableHead>
                <TableHead className="w-[10%]">Preview</TableHead>
                <TableHead className="w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(itemsPerPage)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </TableCell>
                  </TableRow>
                ))
              ) : displayItems.length > 0 ? (
                displayItems.map((item: any) => {
                  const isGallery = selectedCategory === "Photo Gallery"
                  const date = isGallery ? item.uploadedAt : item.publicationDate

                  return (
                    <TableRow key={item._id}>
                      {/* Title */}
                      <TableCell className="font-medium">{item.title}</TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {format(new Date(date), "MMM d, yyyy")}
                        </div>
                      </TableCell>

                      {/* Category Badge */}
                      <TableCell>
                        <Badge
                          variant={getCategoryVariant(isGallery ? "Photo Gallery" : item.category)}
                          className="flex w-fit items-center gap-1"
                        >
                          {getCategoryIcon(isGallery ? "Photo Gallery" : item.category)}
                          <span>{isGallery ? "Photo Gallery" : item.category}</span>
                        </Badge>
                      </TableCell>

                      {/* Description / Photo Count */}
                      <TableCell className="text-sm text-muted-foreground">
                        {isGallery
                          ? `${item.photos.length} photo${item.photos.length > 1 ? "s" : ""}`
                          : item.description}
                      </TableCell>

                      {/* Cover / First Photo */}
                      <TableCell className="text-center">
                        {isGallery ? (
                          item.photos.length > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setPreviewGallery(item)}
                                >
                                  <ImageIcon className="h-4 w-4 text-amber-600" />
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                          )
                        ) : item.photo ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Cover Photo</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center">
                                <img src={item.photo} alt="Cover" className="max-h-[300px] rounded-md" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No image</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="flex gap-1 justify-center">
                        {/* Edit – only for news (gallery edit not implemented) */}
                        {!isGallery && (
                          <Button variant="outline" size="icon">
                            <Link to={`/news-and-events/${item._id}/edit`}>
                              <EditIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}

                        {/* Delete */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setDeleteId(item._id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {deleteId === item._id && (
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="mt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setDeleteId(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(item._id, isGallery)}
                                  disabled={deleting}
                                >
                                  {deleting ? "Deleting…" : "Delete"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ---------- PAGINATION ---------- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* ---------- FULL GALLERY PREVIEW DIALOG ---------- */}
      {previewGallery && (
        <Dialog open={!!previewGallery} onOpenChange={() => setPreviewGallery(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{previewGallery.title}</DialogTitle>
              {previewGallery.description && (
                <p className="text-sm text-muted-foreground">{previewGallery.description}</p>
              )}
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {previewGallery.photos.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-80 transition"
                  onClick={() => window.open(url, "_blank")}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}