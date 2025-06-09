import { useState, useRef } from "react";

export default function AdminUploadNotes() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/notes/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        alert("Upload success");
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (e) {
      alert("An error occurred during upload.");
    }
    setLoading(false);
  };

  return (
    <div>
      <label htmlFor="notes-upload" className="block mb-1 font-medium">Upload Notes (PDF, DOCX, etc.)</label>
      <input
        id="notes-upload"
        type="file"
        ref={inputRef}
        onChange={e => setFile(e.target.files?.[0] ?? null)}
        disabled={loading}
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
