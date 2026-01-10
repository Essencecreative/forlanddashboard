import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Pencil,
  Trash,
  SearchIcon,
  ImageIcon,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../auth-context"
import { useToast } from "../hooks/use-toast"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"

export default function HomeSliderTable() {
  const [sliders, setSliders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState<"title">("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const itemsPerPage = 5
  const { token } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchSliders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://forlandservice.onrender.com/slider/?page=${currentPage}&limit=${itemsPerPage}`)

        if (!res.ok) throw new Error("Failed to fetch home sliders")

        const data = await res.json()
        setSliders(data.sliders)
        setTotalPages(data.totalPages)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchSliders()
  }, [currentPage])

  const filteredSliders = sliders.filter((slider) => {
    const matchesSearch =
      slider.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (slider.subtitle && slider.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const sortedSliders = [...filteredSliders].sort((a, b) => {
    return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
  })

  const paginatedSliders = sortedSliders.slice(0, itemsPerPage)

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sliders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <Button asChild>
            <Link to="/home-slider/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Slider
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">
                  <button className="flex items-center gap-1 font-medium" onClick={toggleSort}>
                    Title
                    {sortDirection === "asc" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                  </button>
                </TableHead>
                <TableHead className="w-[10%] text-center">Image</TableHead>
                <TableHead className="w-[25%]">Subtitle</TableHead>
                <TableHead className="w-[15%]">Button 1</TableHead>
                <TableHead className="w-[15%]">Button 2</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : paginatedSliders.length > 0 ? (
                paginatedSliders.map((slider) => {
                  const hasImage = Boolean(slider.backgroundImage)
                  return (
                    <TableRow key={slider._id}>
                      <TableCell className="font-medium">
                        {slider.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={!hasImage}>
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DialogTrigger>
                                {hasImage && (
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Slider Image</DialogTitle>
                                      <DialogDescription className="mb-4">
                                        Image for <strong>{slider.title}</strong>
                                      </DialogDescription>
                                    </DialogHeader>
                                    <img src={slider.backgroundImage} alt="Slider" className="w-full rounded-xl border" />
                                  </DialogContent>
                                )}
                              </Dialog>
                            </TooltipTrigger>
                            {!hasImage && <TooltipContent>No image uploaded</TooltipContent>}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {slider.subtitle || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {slider.primaryButtonText ? (
                          <div className="truncate max-w-[150px]" title={slider.primaryButtonText}>
                            {slider.primaryButtonText}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {slider.secondaryButtonText ? (
                          <div className="truncate max-w-[150px]" title={slider.secondaryButtonText}>
                            {slider.secondaryButtonText}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/home-slider/${slider._id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => setDeleteId(slider._id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>

                            {deleteId === slider._id && (
                              <DialogContent>
                                <DialogHeader>
                                  <h4 className="text-lg font-semibold">Confirm Deletion</h4>
                                  <p className="text-sm text-muted-foreground">Are you sure you want to delete this slider?</p>
                                </DialogHeader>
                                <DialogFooter className="mt-4 flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      setDeleting(true)
                                      try {
                                        const res = await fetch(`https://forlandservice.onrender.com/slider/${slider._id}`, {
                                          method: "DELETE",
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        })
                                        if (!res.ok) throw new Error("Failed to delete slider")
                                        toast({ title: "Deleted successfully", variant: "default" })
                                        setSliders((prev) => prev.filter((s) => s._id !== slider._id))
                                      } catch (error) {
                                        toast({ title: "Error deleting slider", variant: "destructive" })
                                      } finally {
                                        setDeleteId(null)
                                        setDeleting(false)
                                      }
                                    }}
                                    disabled={deleting}
                                  >
                                    {deleting ? "Deleting..." : "Yes, Delete"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            )}
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No sliders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  )
}
