"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useAuth";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Users, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

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
    setNewAttendance(prev => ({
      ...prev,
      [name]: value
    }));
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
        setNewAttendance({
          studentId: "",
          classId: "",
          subjectId: "",
          date: "",
          status: "present",
        });
        fetchAttendances();
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'absent':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      case 'late':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await fetch(`/api/attendance/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchAttendances();
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
      const response = await fetch(`/api/attendance/${selectedAttendance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedAttendance),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedAttendance(null);
        fetchAttendances();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const presentCount = attendances.filter(a => a.status === 'present').length;
  const absentCount = attendances.filter(a => a.status === 'absent').length;
  const lateCount = attendances.filter(a => a.status === 'late').length;
  const attendanceRate = attendances.length > 0 ? ((presentCount + lateCount) / attendances.length * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-600 text-sm">Track student attendance and punctuality</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TableSearch />
          {isAdmin && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Take Attendance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Attendance</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="studentId">Student</Label>
                    <Select name="studentId" onValueChange={(value) => setNewAttendance(prev => ({ ...prev, studentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} {student.surname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" onValueChange={(value) => setNewAttendance(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      name="date"
                      value={newAttendance.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Record Attendance</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Total Records</p>
              <p className="text-2xl font-bold text-orange-900">{attendances.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Present</p>
              <p className="text-2xl font-bold text-green-900">{presentCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Absent</p>
              <p className="text-2xl font-bold text-red-900">{absentCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-900">{attendanceRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Student</TableHead>
                <TableHead className="font-semibold text-gray-700">Class</TableHead>
                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                {isAdmin && (
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendances.map((attendance) => {
                const statusInfo = getStatusColor(attendance.status);
                return (
                  <TableRow key={attendance.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {attendance.studentName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{attendance.studentName}</p>
                          <p className="text-sm text-gray-500">Student ID: {attendance.studentId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{attendance.className}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {attendance.subject}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDate(attendance.date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`text-xs ${statusInfo.bg} ${statusInfo.text} border-0`}
                      >
                        <statusInfo.icon className="w-3 h-3 mr-1" />
                        {attendance.status}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(attendance)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(attendance.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Modal */}
      {selectedAttendance && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Attendance</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label>Student</Label>
                <Input value={selectedAttendance.studentName} disabled />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={selectedAttendance.status} 
                  onValueChange={(value) => setSelectedAttendance(prev => prev ? { ...prev, status: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedAttendance.date}
                  onChange={(e) => setSelectedAttendance(prev => prev ? { ...prev, date: e.target.value } : null)}
                />
              </div>
              <Button type="submit" className="w-full">Update Attendance</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AttendancePage;