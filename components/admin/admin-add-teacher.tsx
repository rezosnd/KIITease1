import { useState } from "react";
import { Button, Input } from "@/components/ui";

export default function AdminAddTeacher() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTeacher = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, department }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Teacher added!");
      setName("");
      setDepartment("");
    } else {
      alert("Failed to add teacher");
    }
  };

  return (
    <div>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Teacher Name" />
      <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department" />
      <Button onClick={handleAddTeacher} disabled={loading}>Add Teacher</Button>
    </div>
  );
}
