import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Pencil,
  Trash,
  SearchIcon,
  ImageIcon,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Badge } from "./ui/badge"
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


const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "pfp", label: "PFP Technical Reports" },
  { value: "pfp-administrative-and-management", label: "PFP Administrative & Management Reports" },
  { value: "forvac-technical", label: "FORVAC Technical Reports" },
  { value: "forvac-administrative-and-management", label: "FORVAC Administrative & Management Reports" },
  { value: "forland-admin", label: "FORLAND - Admin & Financial Reports" },
  { value: "forland-technical", label: "FORLAND - Project Technical Report" },
  { value: "forland-forms", label: "FORLAND - Forms and Guidelines" },
  { value: "forland-brochure", label: "FORLAND - Brochure & Newsletters" },
  { value: "forland-institutional", label: "FORLAND - Institutional Support" },
];


export default function PublicationsTable() {
  const [publications, setPublications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get("category")
  const urlSubcategory = searchParams.get("subcategory")
  
  // Determine category from URL params or default to "all"
  const getCategoryFromUrl = useCallback(() => {
    if (urlCategory === "forvac" && urlSubcategory === "technical") {
      return "forvac-technical"
    }
    if (urlCategory === "forvac" && urlSubcategory === "admin") {
      return "forvac-administrative-and-management"
    }
    if (urlCategory && urlCategory !== "all") {
      return urlCategory
    }
    return "all"
  }, [urlCategory, urlSubcategory])
  
  const [selectedCategory, setSelectedCategory] = useState(() => getCategoryFromUrl())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState<"title" | "date">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const itemsPerPage = 5
  const { token } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Update selectedCategory when URL params change
  useEffect(() => {
    const newCategory = getCategoryFromUrl()
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory)
      setCurrentPage(1) // Reset to page 1 when category changes
    }
  }, [getCategoryFromUrl, selectedCategory])

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true)
      try {
        // Build API URL with category filter if not "all"
        let apiUrl = `https://forlandservice.onrender.com/publications?page=${currentPage}&limit=${itemsPerPage}`
        if (selectedCategory !== "all") {
          apiUrl += `&category=${selectedCategory}`
        }
        
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch publications")

        const data = await res.json()
        setPublications(data.publications)
        setTotalPages(data.totalPages)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [currentPage, selectedCategory, token])

  // Filter by search query (category filtering is done on backend)
  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const sortedPublications = [...filteredPublications].sort((a, b) => {
    if (sortField === "title") {
      return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    } else {
      return sortDirection === "asc"
        ? new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime()
        : new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
    }
  })

  // Pagination is handled by backend, but we still need to slice for search results
  const paginatedPublications = sortedPublications

  const toggleSort = (field: "title" | "date") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search publications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <Button asChild>
            <Link to="/publicationnew">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Publication
            </Link>
          </Button>
        </div>

        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value)
            setCurrentPage(1)
            // Update URL params when category changes
            if (value === "all") {
              setSearchParams({})
            } else {
              setSearchParams({ category: value })
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">
                  <button className="flex items-center gap-1 font-medium" onClick={() => toggleSort("title")}>
                    Title
                    {sortField === "title" &&
                      (sortDirection === "asc" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}
                  </button>
                </TableHead>
                <TableHead className="w-[10%] text-center">Cover</TableHead>
                <TableHead className="w-[15%]">
                  <button className="flex items-center gap-1 font-medium" onClick={() => toggleSort("date")}>
                    Date
                    {sortField === "date" &&
                      (sortDirection === "asc" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}
                  </button>
                </TableHead>
                <TableHead className="w-[35%]">Description</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : paginatedPublications.length > 0 ? (
                paginatedPublications.map((publication) => {
                  const hasCover = Boolean(publication.photo)
                  return (
                    <TableRow key={publication._id}>
                      <TableCell className="font-medium">
                        <div>
                          {publication.title}
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {publication.category}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={!hasCover}>
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DialogTrigger>
                                {hasCover && (
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Cover Photo</DialogTitle>
                                      <DialogDescription className="mb-4">
                                        Uploaded image for <strong>{publication.title}</strong>
                                      </DialogDescription>
                                    </DialogHeader>
                                    <img src={publication.photo} alt="Cover" className="w-full rounded-xl border" />
                                  </DialogContent>
                                )}
                              </Dialog>
                            </TooltipTrigger>
                            {!hasCover && <TooltipContent>No photo uploaded</TooltipContent>}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {format(new Date(publication.publicationDate), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{publication.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/publications/${publication._id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => setDeleteId(publication._id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>

                            {deleteId === publication._id && (
                              <DialogContent>
                                <DialogHeader>
                                  <h4 className="text-lg font-semibold">Confirm Deletion</h4>
                                  <p className="text-sm text-muted-foreground">Are you sure you want to delete this publication?</p>
                                </DialogHeader>
                                <DialogFooter className="mt-4 flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      setDeleting(true)
                                      try {
                                        const res = await fetch(`https://forlandservice.onrender.com/publications/${publication._id}`, {
                                          method: "DELETE",
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        })
                                        if (!res.ok) throw new Error("Failed to delete publication")
                                        toast({ title: "Deleted successfully", variant: "default" })
                                        
                                        // Refetch publications to update pagination
                                        const refetchRes = await fetch(`https://forlandservice.onrender.com/publications?page=${currentPage}&limit=${itemsPerPage}${selectedCategory !== "all" ? `&category=${selectedCategory}` : ""}`, {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        })
                                        if (refetchRes.ok) {
                                          const refetchData = await refetchRes.json()
                                          setPublications(refetchData.publications)
                                          setTotalPages(refetchData.totalPages)
                                          // If current page is empty after deletion, go to previous page
                                          if (refetchData.publications.length === 0 && currentPage > 1) {
                                            setCurrentPage(currentPage - 1)
                                          }
                                        }
                                      } catch (error) {
                                        toast({ title: "Error deleting publication", variant: "destructive" })
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
                    No publications found.
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
