"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import DashboardLayout from "./dashboard-layout"
import { useAuth } from "../auth-context"
import { useToast } from "../hooks/use-toast"

export default function ProfileSettingsPage() {
  const { token, user } = useAuth()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    username: "",
    password: "",
  })
  const [photoUrl, setPhotoUrl] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)

  console.log(user)

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id || !token) return

      try {
        const res = await fetch(`https://forlandservice.onrender.com/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch user")

        const data = await res.json()
        setProfileData({
          username: data.username || "",
          password: "",
        })
        setPhotoUrl(data.photo || "")
      } catch (error) {
        toast({
          title: "Failed to load profile",
          description: (error as Error).message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setPhotoUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("username", profileData.username)
    if (profileData.password) {
      formData.append("password", profileData.password)
    }
    if (photo) {
      formData.append("photo", photo)
    }

    try {
      const res = await fetch(`https://forlandservice.onrender.com/users/${user?.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={photoUrl} alt="Profile" />
                <AvatarFallback>{profileData.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photo">Change Photo</Label>
                <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={profileData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>Save Changes</Button>
          </CardFooter>
        </Card>
      </form>
    </DashboardLayout>
  )
}
