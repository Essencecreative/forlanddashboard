"use client"

import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import DashboardLayout from "./dashboard-layout"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { SaveIcon, UploadIcon } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../auth-context"

export default function EditTeamMemberPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams()

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    team: "",
    biography: "",
  })

  useEffect(() => {
    const fetchTeamMember = async () => {
      try {
        const res = await fetch(`https://forlandservice.onrender.com/team/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch team member details")

        const data = await res.json()
        setFormData({
          name: data.username,
          jobTitle: data.jobTitle,
          team: data.team,
          biography: data.biography,
        })
        if (data.photo) setPhotoPreview(data.photo)
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      }
    }

    if (id) {
      fetchTeamMember()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value))
      if (photoFile) payload.append("photo", photoFile)

      const res = await fetch(`https://forlandservice.onrender.com/team/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.message || "Failed to update team member")
      }

      toast({
        title: "Success!",
        description: "Team member updated successfully.",
        variant: "default",
      })

      navigate("/team")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Team Member</h1>
          <p className="text-muted-foreground">Update team member details.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Team Member Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || ""} alt={formData.name} />
                    <AvatarFallback>{formData.name ? getInitials(formData.name) : "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <Label
                      htmlFor="photo"
                      className="cursor-pointer rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                    >
                      <UploadIcon className="mr-2 inline-block h-3 w-3" />
                      Upload Photo
                    </Label>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        required
                        placeholder="Enter job title"
                        value={formData.jobTitle}
                        onChange={(e) => handleChange("jobTitle", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Select value={formData.team} onValueChange={(val) => handleChange("team", val)}>
                      <SelectTrigger id="team">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Management Team">Management Team</SelectItem>
                        <SelectItem value="Expert">Other Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  className="min-h-[120px]"
                  placeholder="Enter professional biography"
                  value={formData.biography}
                  onChange={(e) => handleChange("biography", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/team")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Update Member
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}