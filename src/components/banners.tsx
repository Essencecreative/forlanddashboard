"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { useNavigate } from "react-router"
import { useAuth } from "../auth-context"
import { Skeleton } from "./ui/skeleton"
import { Trash2, Edit } from "lucide-react"
import DashboardLayout from "./dashboard-layout"
import { toast } from "../hooks/use-toast"

interface Banner {
  _id: string
  title: string
  image: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { token } = useAuth()

  useEffect(() => {
    const fetchBanners = async (page: number) => {
      try {
        setLoading(true)
        const response = await fetch(`https://forlandservice.onrender.com/banners?page=${page}&limit=10`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setBanners(Array.isArray(data) ? data : data.banners || data.data || [])
          setTotalPages(data.totalPages || 1)
        } else {
          console.error("Failed to fetch banners")
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners(currentPage)
  }, [currentPage, token])

  const handleDelete = async () => {
    if (!selectedId) return

    try {
      setDeleting(true)
      const response = await fetch(`https://forlandservice.onrender.com/banners/${selectedId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setBanners(banners.filter((b) => b._id !== selectedId))
        setDeleteDialogOpen(false)
        setSelectedId(null)
        toast({
          title: "✅ Deleted",
          description: "Banner deleted successfully",
        })
      } else {
        toast({
          title: "❌ Error",
          description: "Failed to delete banner",
        })
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "❌ Error",
        description: "An error occurred while deleting",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`/banners/${id}/edit`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
            <p className="text-muted-foreground mt-2">Manage website banners</p>
          </div>
          <Button onClick={() => navigate("/banners/new")} className="bg-blue-600 hover:bg-blue-700">
            Add Banner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
            <CardDescription>View and manage all banners</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No banners found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {banners.map((banner) => (
                    <div key={banner._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                      <div className="relative h-40 bg-gray-200">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={banner.isActive ? "default" : "outline"}>
                            {banner.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="font-semibold text-sm mb-3 truncate">{banner.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(banner._id)}
                            className="flex-1 gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedId(banner._id)
                              setDeleteDialogOpen(true)
                            }}
                            className="flex-1 gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
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
              <DialogTitle>Delete Banner</DialogTitle>
              <DialogDescription>Are you sure you want to delete this banner? This action cannot be undone.</DialogDescription>
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
