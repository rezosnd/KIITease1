"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Teacher = {
  _id: string;
  name: string;
  department?: string;
  averageRating?: number;
  reviewCount?: number;
};

export default function ReviewsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teachers")
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Teacher Reviews</h1>
      {loading ? (
        <div>Loading teachers...</div>
      ) : teachers.length === 0 ? (
        <div>No teachers found.</div>
      ) : (
        <ul className="space-y-4">
          {teachers.map(teacher => (
            <li key={teacher._id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{teacher.name}</div>
                {teacher.department && (
                  <div className="text-gray-600 text-sm">{teacher.department}</div>
                )}
                {teacher.averageRating !== undefined && (
                  <div className="text-yellow-600 text-sm mt-1">
                    Rating: {teacher.averageRating} ⭐ ({teacher.reviewCount ?? 0} reviews)
                  </div>
                )}
              </div>
              <Link
                href={`/teachers/${teacher._id}/reviews`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                View Reviews
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
