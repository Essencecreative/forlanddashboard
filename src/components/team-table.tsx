import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon as EnvelopeIcon,
  PhoneIcon,
  SearchIcon,
  UserIcon,
  PlusIcon,
  Trash2Icon,
  EditIcon,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../auth-context"
import { useToast } from "../hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "./ui/dialog"
import { API_BASE_URL } from "../lib/api";

interface TeamMember {
  _id: string
  username: string
  jobTitle: string
  photo: string
  team: "Management Team" | "Expert"
  biography: string
}

const teamOptions = [
  { value: "all", label: "All Team Members" },
  { value: "Management Team", label: "Management Team" },
  { value: "Expert", label: "Other Experts" },
]

export default function TeamMembersTable() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"name" | "jobTitle">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)

  const itemsPerPage = 5

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/team`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error("Failed to fetch team members:", error)
        toast({
          title: "Error",
          description: "Failed to fetch team members",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchTeam()
    }
  }, [token, toast])

  const handleDelete = async () => {
    if (!memberToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/team/${memberToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setMembers(members.filter(member => member._id !== memberToDelete))
        toast({
          title: "Success",
          description: "Team member deleted successfully",
        })
      } else {
        throw new Error("Failed to delete team member")
      }
    } catch (error) {
      console.error("Failed to delete team member:", error)
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      })
    } finally {
      setMemberToDelete(null)
    }
  }

  const getInitials = (name: string): string =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.biography.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTeam = selectedTeam === "all" || member.team === selectedTeam

    return matchesSearch && matchesTeam
  })

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const valueA = sortField === "name" ? a.username : a.jobTitle
    const valueB = sortField === "name" ? b.username : b.jobTitle
    return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
  })

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage)
  const paginatedMembers = sortedMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleSort = (field: "name" | "jobTitle") => {
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
              placeholder="Search team members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <Button asChild>
            <Link to="/teamnew">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Team Member
            </Link>
          </Button>
        </div>
        <Select
          value={selectedTeam}
          onValueChange={(value) => {
            setSelectedTeam(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teamOptions.map((option) => (
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
                <TableHead className="w-[15%]">Photo</TableHead>
                <TableHead className="w-[30%]">
                  <button className="flex items-center gap-1 font-medium" onClick={() => toggleSort("name")}>
                    Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      ))}
                  </button>
                </TableHead>
                <TableHead className="w-[30%]">
                  <button className="flex items-center gap-1 font-medium" onClick={() => toggleSort("jobTitle")}>
                    Job Title
                    {sortField === "jobTitle" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      ))}
                  </button>
                </TableHead>
                <TableHead className="w-[15%]">Team</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton className="h-16 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                : paginatedMembers.length > 0
                  ? paginatedMembers.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell>
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={member.photo || "/placeholder.svg"} alt={member.username} />
                            <AvatarFallback>{getInitials(member.username)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{member.username}</span>
                            <span className="text-xs text-muted-foreground">{member.biography}</span>
                            <div className="mt-1 flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <EnvelopeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>No email</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <PhoneIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>No phone</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.jobTitle}</TableCell>
                        <TableCell>
                          <Badge
                            variant={member.team === "Management Team" ? "default" : "secondary"}
                            className="flex w-fit items-center gap-1"
                          >
                            <UserIcon className="h-3 w-3" />
                            <span>{member.team}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link to={`/team/${member._id}/edit`}>
                                <EditIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                  onClick={() => setMemberToDelete(member._id)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <h2 className="text-lg font-semibold">Delete Team Member</h2>
                                  <p className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this team member? This action cannot be undone.
                                  </p>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setMemberToDelete(null)}>
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={handleDelete}>
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredMembers.length)}</span> of{" "}
              <span className="font-medium">{filteredMembers.length}</span> team members
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
      </Card>
    </div>
  )
}