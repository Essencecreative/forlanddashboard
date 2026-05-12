"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  CalendarIcon,
  PlusIcon,
  TagIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../auth-context"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "./ui/dialog"
import { useToast } from "../hooks/use-toast" // Importing useToast
import DashboardLayout from "./dashboard-layout"
import { API_BASE_URL } from "../lib/api";

type Opportunity = {
  _id: string
  title: string
  description: string
  documentUrl?: string
  date?: string
  createdAt?: string
  category: "Job Vacancy" | "Call for Proposal"
}

const categoryOptions = [
  { value: "all", label: "All Opportunities" },
  { value: "Call for Proposal", label: "Call for Proposal" },
  { value: "Job Vacancy", label: "Job Vacancy" },
]

export default function OpportunitiesTable() {
  const { token } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"title" | "date">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast() // Using the custom toast hook

  const itemsPerPage = 5

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/opportunities`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Failed to fetch opportunities")
        const data = await res.json()
        setOpportunities(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOpportunities()
    }
  }, [token])

  const filtered = opportunities.filter((op) => {
    const matchesSearch =
      op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || op.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "title") {
      return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    } else {
      const aDate = new Date(a.createdAt || a.date || "").getTime()
      const bDate = new Date(b.createdAt || b.date || "").getTime()
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate
    }
  })

  const totalPages = Math.ceil(sorted.length / itemsPerPage)
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleSort = (field: "title" | "date") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      setDeleting(true)
      try {
        const res = await fetch(`${API_BASE_URL}/opportunities/${deleteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Failed to delete opportunity")
        setOpportunities(opportunities.filter((op) => op._id !== deleteId)) // Remove deleted opportunity from the list
        setDeleteId(null)
        toast({ title: "Deleted successfully", variant: "default" }) // Using the custom toast hook
      } catch (error) {
        toast({ title: "Error deleting opportunity", variant: "destructive" }) // Using the custom toast hook
      } finally {
        setDeleting(false)
      }
    }
  }

  return (
   <DashboardLayout>
     <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search opportunities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
          <Button asChild>
            <Link to="/opportunitiesnew">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Opportunity
            </Link>
          </Button>
        </div>

        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value)
            setCurrentPage(1)
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
        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">Error: {error}</div>
        ) : (
          <>
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
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 font-medium" onClick={() => toggleSort("date")}>
                        Date
                        {sortField === "date" &&
                          (sortDirection === "asc" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length > 0 ? (
                    paginated.map((op) => (
                      <TableRow key={op._id}>
                        <TableCell className="font-medium">{op.title}</TableCell>
                        <TableCell>{op.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(op.createdAt || op.date || "").toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {op.documentUrl ? (
                            <a
                              href={op.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <FileTextIcon className="h-4 w-4" />
                              View File
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={op.category === "Call for Proposal" ? "default" : "secondary"}
                            className="flex w-fit items-center gap-1"
                          >
                            <TagIcon className="h-3 w-3" />
                            <span>{op.category}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/opportunities/edit/${op._id}`}>
                              <EditIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => setDeleteId(op._id)}>
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>

                            {deleteId === op._id && (
                              <DialogContent>
                                <DialogHeader>
                                  <h4 className="text-lg font-semibold">Confirm Deletion</h4>
                                  <p className="text-sm text-muted-foreground">Are you sure you want to delete this opportunity?</p>
                                </DialogHeader>
                                <DialogFooter className="mt-4 flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                  >
                                    {deleting ? "Deleting..." : "Yes, Delete"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            )}
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No opportunities found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{" "}
                  <span className="font-medium">{filtered.length}</span> opportunities
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
   </DashboardLayout>
  )
}
