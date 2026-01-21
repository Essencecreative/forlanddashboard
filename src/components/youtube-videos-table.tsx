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
  ExternalLink,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../auth-context"
import { useToast } from "../hooks/use-toast"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog"

export default function YouTubeVideosTable() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const itemsPerPage = 5
  const { token } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://forlandservice.onrender.com/youtube/?page=${currentPage}&limit=${itemsPerPage}`)

        if (!res.ok) throw new Error("Failed to fetch YouTube videos")

        const data = await res.json()
        setVideos(data.videos || [])
        setTotalPages(data.totalPages || 1)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [currentPage])

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
  })

  const paginatedVideos = sortedVideos.slice(0, itemsPerPage)

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
              placeholder="Search videos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <Button asChild>
            <Link to="/youtube-videos/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Video
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
                <TableHead className="w-[30%]">Description</TableHead>
                <TableHead className="w-[20%]">YouTube Link</TableHead>
                <TableHead className="w-[15%]">Button Link</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : paginatedVideos.length > 0 ? (
                paginatedVideos.map((video) => {
                  return (
                    <TableRow key={video._id}>
                      <TableCell className="font-medium">
                        {video.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {video.description ? (
                          <div className="truncate max-w-[300px]" title={video.description}>
                            {video.description}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {video.youtubeUrl ? (
                          <a
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Watch Video
                          </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {video.buttonLink ? (
                          <div className="text-sm">
                            <div className="font-medium text-xs text-muted-foreground mb-1">{video.buttonText || "Link"}</div>
                            <a
                              href={video.buttonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {video.buttonLink.length > 20 ? video.buttonLink.substring(0, 20) + "..." : video.buttonLink}
                            </a>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/youtube-videos/${video._id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => setDeleteId(video._id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>

                            {deleteId === video._id && (
                              <DialogContent>
                                <DialogHeader>
                                  <h4 className="text-lg font-semibold">Confirm Deletion</h4>
                                  <p className="text-sm text-muted-foreground">Are you sure you want to delete this video?</p>
                                </DialogHeader>
                                <DialogFooter className="mt-4 flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      setDeleting(true)
                                      try {
                                        const res = await fetch(`https://forlandservice.onrender.com/youtube/${video._id}`, {
                                          method: "DELETE",
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        })
                                        if (!res.ok) throw new Error("Failed to delete video")
                                        toast({ title: "Deleted successfully", variant: "default" })
                                        setVideos((prev) => prev.filter((v) => v._id !== video._id))
                                      } catch (error) {
                                        toast({ title: "Error deleting video", variant: "destructive" })
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
                  <TableCell colSpan={5} className="text-center">
                    No videos found.
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
