"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SkeletonLoader } from "@/components/ui/skeleton-loader"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Trash2, Search } from "lucide-react"

export default function AdminNotesList() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/notes")
      const data = await response.json()
      setNotes(data.notes || [])
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

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Note deleted successfully",
        })
        fetchNotes()
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: data.error || "Failed to delete note",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const downloadNote = async (note: any) => {
    setDownloading(note._id)
    try {
      const response = await fetch(`/api/admin/notes/${note._id}/download`)
      if (!response.ok) throw new Error("Download failed")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = note.fileName || `${note.title}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download note",
        variant: "destructive",
      })
    } finally {
      setDownloading(null)
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Study Notes Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Study Notes</CardTitle>
          <CardDescription>Manage study materials and uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonLoader key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Branch/Year</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No notes found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredNotes.map((note) => (
                    <TableRow key={note._id}>
                      <TableCell>
                        <div className="font-medium">{note.title}</div>
                        <div className="text-sm text-gray-500">{note.fileName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{note.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {note.branch} - Year {note.year}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{note.uploadedBy?.name || "Admin"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadNote(note)}
                            disabled={downloading === note._id}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteNote(note._id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
