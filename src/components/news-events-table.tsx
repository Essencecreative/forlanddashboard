// src/components/NewsEventsTable.tsx
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"
import {
  CalendarIcon, ChevronLeftIcon, ChevronRightIcon,
  ImageIcon, NewspaperIcon, RadioIcon,
  SearchIcon, UsersIcon, PlusIcon, EditIcon, Trash2Icon
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

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Media News", label: "Media News" },
  { value: "General News", label: "General News" },
  { value: "Events and Trainings", label: "Events and Trainings" },
  { value: "Radio Programmes", label: "Radio Programmes" },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Media News": return <NewspaperIcon className="h-4 w-4 text-blue-500" />
    case "General News": return <NewspaperIcon className="h-4 w-4 text-gray-500" />
    case "Events and Trainings": return <UsersIcon className="h-4 w-4 text-green-500" />
    case "Radio Programmes": return <RadioIcon className="h-4 w-4 text-purple-500" />
    default: return <NewspaperIcon className="h-4 w-4" />
  }
}

const getCategoryVariant = (category: string): "default" | "outline" | "secondary" | "destructive" => {
  switch (category) {
    case "Media News": return "default"
    case "General News": return "secondary"
    case "Events and Trainings": return "outline"
    case "Radio Programmes": return "destructive"
    default: return "default"
  }
}

export default function NewsEventsTable() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const urlCategory = searchParams.get("category")?.trim() || "all"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(urlCategory)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [newsItems, setNewsItems] = useState<any[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const itemsPerPage = 5

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://forlandservice.onrender.com/news?page=${currentPage}&limit=${itemsPerPage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        setNewsItems(data.news || [])
        setTotalPages(data.totalPages || 1)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, currentPage, selectedCategory])

  const filteredNews = newsItems.filter((item: any) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`https://forlandservice.onrender.com/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Delete failed")
      setNewsItems(prev => prev.filter(i => i._id !== id))
      setDeleteId(null)
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
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

          <Button asChild>
            <Link to="/newsnew">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add News
            </Link>
          </Button>
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

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Title</TableHead>
                <TableHead className="w-[15%]">Date</TableHead>
                <TableHead className="w-[15%]">Category</TableHead>
                <TableHead className="w-[25%]">Description</TableHead>
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
              ) : filteredNews.length > 0 ? (
                filteredNews.map((item: any) => {
                  const date = item.publicationDate

                  return (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.title}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {format(new Date(date), "MMM d, yyyy")}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={getCategoryVariant(item.category)}
                          className="flex w-fit items-center gap-1"
                        >
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {item.description}
                      </TableCell>

                      <TableCell className="text-center">
                        {item.photo ? (
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

                      <TableCell className="flex gap-1 justify-center">
                        <Button variant="outline" size="icon">
                          <Link to={`/news-and-events/${item._id}/edit`}>
                            <EditIcon className="h-4 w-4" />
                          </Link>
                        </Button>

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
                                  onClick={() => handleDelete(item._id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 px-4 pb-4">
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
    </div>
  )
}
