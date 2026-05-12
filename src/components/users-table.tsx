"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  SearchIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Skeleton } from "./ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import DashboardLayout from "./dashboard-layout"
import { useAuth } from "../auth-context"
import { API_BASE_URL } from "../lib/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog"

type User = {
  _id: string
  username: string
  role: string
  photo?: string
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { token } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch users")

        const data: User[] = await res.json()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token])

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      const res = await fetch(`${API_BASE_URL}/users/delete-team-member/${selectedUser._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to delete user")

      setUsers(prev => prev.filter(user => user._id !== selectedUser._id))
      setSelectedUser(null)
      setOpenDialog(false)
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link to="/usernew">
                <PlusIcon className="mr-2 h-4 w-4" />
                New User
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Photo</TableHead>
                  <TableHead className="w-[30%]">Username</TableHead>
                  <TableHead className="w-[30%]">Role</TableHead>
                  <TableHead className="w-[20%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-16 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-3/4 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-1/2 h-4" />
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : filteredUsers.length ? (
                  filteredUsers.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.photo || ""} alt={user.username} />
                          <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <UserIcon className="h-3 w-3" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setOpenDialog(true)
                              }}
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <h2 className="text-lg font-semibold">Confirm Deletion</h2>
                              <p>
                                Are you sure you want to delete{" "}
                                <strong>{selectedUser?.username}</strong>? This action cannot be
                                undone.
                              </p>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={handleDelete}>
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
