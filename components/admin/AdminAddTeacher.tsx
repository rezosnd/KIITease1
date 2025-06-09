import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function AdminAddTeacher({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, department }),
    });
    setLoading(false);

    const data = await res.json();
    if (res.ok) {
      setName("");
      setDepartment("");
      onAdded && onAdded();
      alert("Teacher added!");
    } else {
      alert(data.error || "Failed to add teacher");
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Teacher Name"
        disabled={loading}
      />
      <Input
        value={department}
        onChange={e => setDepartment(e.target.value)}
        placeholder="Department"
        disabled={loading}
      />
      <Button onClick={handleAdd} disabled={loading || !name || !department}>
        {loading ? "Adding..." : "Add Teacher"}
      </Button>
    </div>
  );
}
