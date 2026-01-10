"use client"

import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { useNavigate } from "react-router"
import { useAuth } from "../auth-context"
import { Skeleton } from "./ui/skeleton"
import { Trash2, Edit } from "lucide-react"
import DashboardLayout from "./dashboard-layout"

interface OrganizationStructure {
  _id: string
  title: string
  description: string
  isActive: boolean
  banner?: string
  createdAt?: string
  updatedAt?: string
}

export default function OrganizationStructurePage() {
  const [structures, setStructures] = useState<OrganizationStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { token } = useAuth()

  useEffect(() => {
    fetchStructures(currentPage)
  }, [currentPage])

  const fetchStructures = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`https://forlandservice.onrender.com/organization-structure?page=${page}&limit=10`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStructures(Array.isArray(data) ? data : data.structures || data.data || [])
        setTotalPages(data.totalPages || 1)
      } else {
        console.error("Failed to fetch organization structures")
      }
    } catch (error) {
      console.error("Error fetching organization structures:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return

    try {
      setDeleting(true)
      const response = await fetch(`https://forlandservice.onrender.com/organization-structure/${selectedId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setStructures(structures.filter((s) => s._id !== selectedId))
        setDeleteDialogOpen(false)
        setSelectedId(null)
      } else {
        alert("Failed to delete organization structure")
      }
    } catch (error) {
      console.error("Error deleting organization structure:", error)
      alert("An error occurred while deleting")
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`/organization-structure/${id}/edit`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Structure</h1>
            <p className="text-muted-foreground mt-2">Manage organization structure information and charts</p>
          </div>
          <Button onClick={() => navigate("/organization-structure/new")} className="bg-blue-600 hover:bg-blue-700">
            Add Organization Structure
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Structures</CardTitle>
            <CardDescription>View all organization structures</CardDescription>
          </CardHeader>
          <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : structures.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No organization structures found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structures.map((structure) => (
                    <TableRow key={structure._id}>
                      <TableCell className="font-medium">{structure.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{structure.description || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={structure.isActive ? "default" : "outline"}>
                          {structure.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(structure._id)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedId(structure._id)
                              setDeleteDialogOpen(true)
                            }}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization Structure</DialogTitle>
            <DialogDescription>Are you sure you want to delete this organization structure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}
