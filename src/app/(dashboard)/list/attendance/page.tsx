"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useAuth";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc } from "lucide-react";



interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  status: "present" | "absent" | "late";
  subject: string;
}

const AttendancePage = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAttendance, setNewAttendance] = useState({
    studentId: "",
    classId: "",
    subjectId: "",
    date: "",
    status: "present",
  });
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        setAttendances(data);
        setFilteredAttendances(data);
      } catch (error) {
        console.error('Error fetching attendances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendances();

    const fetchDropdownData = async () => {
      try {
        const [studentsRes, classesRes, subjectsRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/classes'),
          fetch('/api/subjects'),
        ]);
        const [studentsData, classesData, subjectsData] = await Promise.all([
          studentsRes.json(),
          classesRes.json(),
          subjectsRes.json(),
        ]);
        setStudents(studentsData);
        setClasses(classesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const fetchAttendances = async () => {
    try {
      const response = await fetch('/api/attendance');
      const data = await response.json();
      setAttendances(data);
      setFilteredAttendances(data);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAttendance((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAttendance),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchAttendances(); // Refetch data
        setNewAttendance({
          studentId: "",
          classId: "",
          subjectId: "",
          date: "",
          status: "present",
        });
      } else {
        console.error('Failed to create attendance');
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  useEffect(() => {
    const filtered = attendances.filter((attendance) =>
      attendance.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAttendances(filtered);
  }, [searchTerm, attendances]);

  const columns = [
    { header: "Student Name", accessor: "studentName" },
    { header: "Class", accessor: "className" },
    { header: "Subject", accessor: "subject" },
    { header: "Date", accessor: "date" },
    { header: "Status", accessor: "status" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-100";
      case "absent":
        return "text-red-600 bg-red-100";
      case "late":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/attendance?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchAttendances();
        } else {
          console.error('Failed to delete attendance');
        }
      } catch (error) {
        console.error('Error deleting attendance:', error);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendance) return;

    try {
      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedAttendance),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        fetchAttendances();
      } else {
        console.error('Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const renderRow = (item: Attendance) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.studentName}</td>
      <td className="p-4">{item.className}</td>
      <td className="p-4">{item.subject}</td>
      <td className="p-4">{item.date}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      </td>
      {isAdmin && (
        <td className="p-4 flex items-center gap-2">
          <button onClick={() => handleEdit(item)} className="text-blue-500 hover:underline">
            <img src="/update.png" alt="" width={16} height={16} />
          </button>
          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">
            <img src="/delete.png" alt="" width={16} height={16} />
          </button>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Attendance Records</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by student, class, subject, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-4 self-end">
            <Button variant="outline" size="sm" onClick={() => console.log('Filter attendance')}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log('Sort attendance')}>
              <SortAsc className="w-4 h-4 mr-2" />
              Sort
            </Button>
                        {isAdmin && <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <img src="/create.png" alt="" width={14} height={14} />
            </button>}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        data={filteredAttendances}
        columns={isAdmin ? [...columns, { header: "Actions", accessor: "actions" }] : columns}
        renderRow={renderRow}
      />

      {isModalOpen && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4"><img src="/close.png" alt="" width={20} height={20} /></button>
            <h2 className="text-xl font-semibold mb-4">Add Attendance Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select name="studentId" value={newAttendance.studentId} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select name="classId" value={newAttendance.classId} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select name="subjectId" value={newAttendance.subjectId} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newAttendance.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select name="status" value={newAttendance.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-lamaYellow text-white rounded-md">
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedAttendance && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4"><img src="/close.png" alt="" width={20} height={20} /></button>
            <h2 className="text-xl font-semibold mb-4">Edit Attendance Record</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select name="studentId" value={selectedAttendance.studentId} onChange={(e) => setSelectedAttendance({ ...selectedAttendance, studentId: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md">
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select name="classId" value={selectedAttendance.className} onChange={(e) => setSelectedAttendance({ ...selectedAttendance, className: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md">
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select name="subjectId" value={selectedAttendance.subject} onChange={(e) => setSelectedAttendance({ ...selectedAttendance, subject: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md">
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={selectedAttendance.date}
                  onChange={(e) => setSelectedAttendance({ ...selectedAttendance, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select name="status" value={selectedAttendance.status} onChange={(e) => setSelectedAttendance({ ...selectedAttendance, status: e.target.value as "present" | "absent" | "late" })} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-lamaYellow text-white rounded-md">
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;