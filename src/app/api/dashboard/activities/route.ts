import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, validateUserSession, AppError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Validate user session
    if (!validateUserSession(user)) {
      throw new AppError("Invalid user session", 401);
    }
    
    const userType = user.userType.toLowerCase();
    
    let activities: any[] = [];

    switch (userType) {
      case 'admin':
        activities = await getAdminActivities();
        break;
      case 'teacher':
        activities = await getTeacherActivities(user.id);
        break;
      case 'student':
        activities = await getStudentActivities(user.id);
        break;
      case 'parent':
        activities = await getParentActivities(user.id);
        break;
      default:
        activities = await getAdminActivities();
    }

    return NextResponse.json({ activities });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getAdminActivities() {
  const [
    recentAssignments,
    recentAnnouncements,
    recentExams,
    recentMessages
  ] = await Promise.all([
    prisma.assignment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          include: {
            subject: true,
            teacher: true
          }
        }
      }
    }),
    prisma.announcement.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: {
        class: true
      }
    }),
    prisma.exam.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: {
        subject: true
      }
    }),
    prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        sender: true
      }
    })
  ]);

  const activities = [];

  // Add assignments
  recentAssignments.forEach(assignment => {
    activities.push({
      icon: "CheckCircle",
      title: "Assignment Created",
      description: `${assignment.title} - ${assignment.lesson.subject.name}`,
      time: formatTimeAgo(assignment.createdAt),
      color: "text-green-600 bg-green-100",
      type: "assignment"
    });
  });

  // Add announcements
  recentAnnouncements.forEach(announcement => {
    activities.push({
      icon: "Bell",
      title: "New Announcement",
      description: announcement.title,
      time: formatTimeAgo(announcement.date),
      color: "text-blue-600 bg-blue-100",
      type: "announcement"
    });
  });

  // Add exams
  recentExams.forEach(exam => {
    activities.push({
      icon: "Clock",
      title: "Exam Scheduled",
      description: `${exam.title} - ${exam.subject.name}`,
      time: formatTimeAgo(exam.date),
      color: "text-orange-600 bg-orange-100",
      type: "exam"
    });
  });

  // Add messages
  recentMessages.forEach(message => {
    activities.push({
      icon: "MessageSquare",
      title: "New Message",
      description: `From ${message.sender.name} ${message.sender.surname}`,
      time: formatTimeAgo(message.createdAt),
      color: "text-purple-600 bg-purple-100",
      type: "message"
    });
  });

  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
}

async function getTeacherActivities(teacherId: string) {
  const [
    recentAssignments,
    recentAttendance,
    recentResults,
    recentMessages
  ] = await Promise.all([
    prisma.assignment.findMany({
      take: 5,
      where: {
        lesson: {
          teacherId: teacherId
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          include: {
            subject: true,
            class: true
          }
        }
      }
    }),
    prisma.attendance.findMany({
      take: 5,
      where: {
        lesson: {
          teacherId: teacherId
        }
      },
      orderBy: { date: "desc" },
      include: {
        student: true,
        lesson: {
          include: {
            subject: true
          }
        }
      }
    }),
    prisma.result.findMany({
      take: 5,
      where: {
        assignment: {
          lesson: {
            teacherId: teacherId
          }
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        assignment: {
          include: {
            lesson: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    }),
    prisma.message.findMany({
      take: 5,
      where: {
        OR: [
          { senderId: teacherId },
          {
            recipients: {
              some: {
                recipientId: teacherId
              }
            }
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: true
      }
    })
  ]);

  const activities = [];

  // Add assignments
  recentAssignments.forEach(assignment => {
    activities.push({
      icon: "CheckCircle",
      title: "Assignment Created",
      description: `${assignment.title} - ${assignment.lesson.class.name}`,
      time: formatTimeAgo(assignment.createdAt),
      color: "text-green-600 bg-green-100",
      type: "assignment"
    });
  });

  // Add attendance
  recentAttendance.forEach(attendance => {
    activities.push({
      icon: attendance.present ? "CheckCircle" : "X",
      title: attendance.present ? "Student Present" : "Student Absent",
      description: `${attendance.student.name} - ${attendance.lesson.subject.name}`,
      time: formatTimeAgo(attendance.date),
      color: attendance.present ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100",
      type: "attendance"
    });
  });

  // Add results
  recentResults.forEach(result => {
    activities.push({
      icon: "Award",
      title: "Grade Submitted",
      description: `${result.student.name} - ${result.score}%`,
      time: formatTimeAgo(result.createdAt),
      color: "text-purple-600 bg-purple-100",
      type: "result"
    });
  });

  // Add messages
  recentMessages.forEach(message => {
    activities.push({
      icon: "MessageSquare",
      title: message.senderId === teacherId ? "Message Sent" : "Message Received",
      description: `From ${message.sender.name} ${message.sender.surname}`,
      time: formatTimeAgo(message.createdAt),
      color: "text-blue-600 bg-blue-100",
      type: "message"
    });
  });

  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
}

async function getStudentActivities(studentId: string) {
  const [
    recentAssignments,
    recentResults,
    recentAttendance,
    recentMessages
  ] = await Promise.all([
    prisma.assignment.findMany({
      take: 5,
      where: {
        lesson: {
          class: {
            students: {
              some: { id: studentId }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          include: {
            subject: true,
            teacher: true
          }
        }
      }
    }),
    prisma.result.findMany({
      take: 5,
      where: { studentId },
      orderBy: { createdAt: "desc" },
      include: {
        assignment: {
          include: {
            lesson: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    }),
    prisma.attendance.findMany({
      take: 5,
      where: { studentId },
      orderBy: { date: "desc" },
      include: {
        lesson: {
          include: {
            subject: true
          }
        }
      }
    }),
    prisma.message.findMany({
      take: 5,
      where: {
        OR: [
          { senderId: studentId },
          {
            recipients: {
              some: {
                recipientId: studentId
              }
            }
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: true
      }
    })
  ]);

  const activities = [];

  // Add assignments
  recentAssignments.forEach(assignment => {
    activities.push({
      icon: "CheckCircle",
      title: "New Assignment",
      description: `${assignment.title} - ${assignment.lesson.subject.name}`,
      time: formatTimeAgo(assignment.createdAt),
      color: "text-green-600 bg-green-100",
      type: "assignment"
    });
  });

  // Add results
  recentResults.forEach(result => {
    activities.push({
      icon: "Award",
      title: "Grade Received",
      description: `${result.assignment.title} - ${result.score}%`,
      time: formatTimeAgo(result.createdAt),
      color: "text-purple-600 bg-purple-100",
      type: "result"
    });
  });

  // Add attendance
  recentAttendance.forEach(attendance => {
    activities.push({
      icon: attendance.present ? "CheckCircle" : "X",
      title: attendance.present ? "Marked Present" : "Marked Absent",
      description: attendance.lesson.subject.name,
      time: formatTimeAgo(attendance.date),
      color: attendance.present ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100",
      type: "attendance"
    });
  });

  // Add messages
  recentMessages.forEach(message => {
    activities.push({
      icon: "MessageSquare",
      title: message.senderId === studentId ? "Message Sent" : "Message Received",
      description: `From ${message.sender.name} ${message.sender.surname}`,
      time: formatTimeAgo(message.createdAt),
      color: "text-blue-600 bg-blue-100",
      type: "message"
    });
  });

  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
}

async function getParentActivities(parentId: string) {
  const [
    childrenResults,
    childrenAttendance,
    recentAnnouncements,
    recentMessages
  ] = await Promise.all([
    prisma.result.findMany({
      take: 5,
      where: {
        student: { parentId }
      },
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        assignment: {
          include: {
            lesson: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    }),
    prisma.attendance.findMany({
      take: 5,
      where: {
        student: { parentId }
      },
      orderBy: { date: "desc" },
      include: {
        student: true,
        lesson: {
          include: {
            subject: true
          }
        }
      }
    }),
    prisma.announcement.findMany({
      take: 5,
      where: {
        OR: [
          { classId: null },
          {
            class: {
              students: {
                some: { parentId }
              }
            }
          }
        ]
      },
      orderBy: { date: "desc" },
      include: {
        class: true
      }
    }),
    prisma.message.findMany({
      take: 5,
      where: {
        OR: [
          { senderId: parentId },
          {
            recipients: {
              some: {
                recipientId: parentId
              }
            }
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: true
      }
    })
  ]);

  const activities = [];

  // Add children results
  childrenResults.forEach(result => {
    activities.push({
      icon: "Award",
      title: "Child Grade Received",
      description: `${result.student.name} - ${result.score}%`,
      time: formatTimeAgo(result.createdAt),
      color: "text-purple-600 bg-purple-100",
      type: "result"
    });
  });

  // Add children attendance
  childrenAttendance.forEach(attendance => {
    activities.push({
      icon: attendance.present ? "CheckCircle" : "X",
      title: attendance.present ? "Child Present" : "Child Absent",
      description: `${attendance.student.name} - ${attendance.lesson.subject.name}`,
      time: formatTimeAgo(attendance.date),
      color: attendance.present ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100",
      type: "attendance"
    });
  });

  // Add announcements
  recentAnnouncements.forEach(announcement => {
    activities.push({
      icon: "Bell",
      title: "School Announcement",
      description: announcement.title,
      time: formatTimeAgo(announcement.date),
      color: "text-blue-600 bg-blue-100",
      type: "announcement"
    });
  });

  // Add messages
  recentMessages.forEach(message => {
    activities.push({
      icon: "MessageSquare",
      title: message.senderId === parentId ? "Message Sent" : "Message Received",
      description: `From ${message.sender.name} ${message.sender.surname}`,
      time: formatTimeAgo(message.createdAt),
      color: "text-orange-600 bg-orange-100",
      type: "message"
    });
  });

  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
} 