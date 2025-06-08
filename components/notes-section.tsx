"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Download, Upload, Search, Filter, FileText, Lock } from "lucide-react"

interface Note {
  _id: string
  title: string
  description: string
  branch: string
  year: number
  subject: string
  fileUrl: string
  uploadedBy: string
  uploadedAt: string
  downloads: number
}

interface NotesSectionProps {
  user: any
}

export default function NotesSection({ user }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [uploadMode, setUploadMode] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    subject: "",
    branch: user.branch || "",
    year: user.year || 1,
  })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const { toast } = useToast()

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "EEE", "CSSE", "CSCE"]
  const years = [1, 2, 3, 4]

  useEffect(() => {
    fetchNotes()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    filterNotes()
    // eslint-disable-next-line
  }, [notes, searchTerm, selectedBranch, selectedYear])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedBranch !== "all") {
      filtered = filtered.filter((note) => note.branch === selectedBranch)
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter((note) => note.year === Number.parseInt(selectedYear))
    }

    setFilteredNotes(filtered)
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.title || !uploadData.subject) {
      toast({
        title: "Error",
        description: "Please fill all required fields and select a file",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("file", uploadFile)
    formData.append("title", uploadData.title)
    formData.append("description", uploadData.description)
    formData.append("subject", uploadData.subject)
    formData.append("branch", uploadData.branch)
    formData.append("year", uploadData.year.toString())

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Note uploaded successfully",
        })
        setUploadMode(false)
        setUploadData({
          title: "",
          description: "",
          subject: "",
          branch: user.branch || "",
          year: user.year || 1,
        })
        setUploadFile(null)
        fetchNotes()
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload note",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (noteId: string, title: string) => {
    if (user.role === "free") {
      toast({
        title: "Premium Required",
        description: "Upgrade to premium to download notes",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Note downloaded successfully",
        })
      } else {
        throw new Error("Download failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download note",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Notes</h2>
          <p className="text-gray-600">Access premium study materials for KIIT courses</p>
        </div>
        <Button onClick={() => setUploadMode(!uploadMode)} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          {uploadMode ? "Cancel Upload" : "Upload Note"}
        </Button>
      </div>

      {/* Upload Form */}
      {uploadMode && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Upload New Note</CardTitle>
              <CardDescription>Share your study materials with fellow KIIT students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g., Data Structures Notes"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={uploadData.subject}
                    onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                    placeholder="e.g., Data Structures"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={uploadData.branch}
                    onValueChange={(value) => setUploadData({ ...uploadData, branch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={uploadData.year.toString()}
                    onValueChange={(value) => setUploadData({ ...uploadData, year: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Brief description of the notes"
                />
              </div>

              <div>
                <Label htmlFor="file">File (PDF, DOC, DOCX) *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button onClick={handleUpload} className="w-full">
                Upload Note
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="branch-filter">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year-filter">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedBranch("all"); setSelectedYear("all"); }} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note, index) => (
          <motion.div
            key={note._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-blue-600" />
                  {user.role === "free" && <Lock className="h-4 w-4 text-gray-400" />}
                </div>
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <CardDescription>{note.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{note.branch}</Badge>
                    <Badge variant="outline">Year {note.year}</Badge>
                    <Badge variant="outline">{note.subject}</Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Downloads: {note.downloads}</p>
                    <p>Uploaded: {new Date(note.uploadedAt).toLocaleDateString()}</p>
                  </div>

                  <Button
                    onClick={() => handleDownload(note._id, note.title)}
                    disabled={user.role === "free"}
                    className="w-full"
                    variant={user.role === "free" ? "outline" : "default"}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {user.role === "free" ? "Premium Required" : "Download"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or upload the first note!</p>
        </div>
      )}
    </div>
  )
}
