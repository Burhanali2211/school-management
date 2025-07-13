"use client";

import { useState, useEffect } from "react";
import { AuditLog, UserType } from "@prisma/client";
import { format } from "date-fns";

interface AuditLogWithType extends AuditLog {
  userType: UserType;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: "",
    userType: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [filter]);

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.action) params.append("action", filter.action);
      if (filter.userType) params.append("userType", filter.userType);
      if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
      if (filter.dateTo) params.append("dateTo", filter.dateTo);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "text-green-600 bg-green-50";
      case "LOGOUT":
        return "text-blue-600 bg-blue-50";
      case "LOGIN_FAILED":
        return "text-red-600 bg-red-50";
      case "CREATE":
        return "text-purple-600 bg-purple-50";
      case "UPDATE":
        return "text-yellow-600 bg-yellow-50";
      case "DELETE":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getUserTypeColor = (type: UserType) => {
    switch (type) {
      case "ADMIN":
        return "text-purple-800 bg-purple-100";
      case "TEACHER":
        return "text-blue-800 bg-blue-100";
      case "STUDENT":
        return "text-green-800 bg-green-100";
      case "PARENT":
        return "text-yellow-800 bg-yellow-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lamaPurple"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaPurple focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="LOGIN_FAILED">Failed Login</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>

          <select
            value={filter.userType}
            onChange={(e) => setFilter({ ...filter, userType: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaPurple focus:border-transparent"
          >
            <option value="">All User Types</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="PARENT">Parent</option>
          </select>

          <input
            type="date"
            value={filter.dateFrom}
            onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaPurple focus:border-transparent"
            placeholder="From Date"
          />

          <input
            type="date"
            value={filter.dateTo}
            onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaPurple focus:border-transparent"
            placeholder="To Date"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.userId}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getUserTypeColor(log.userType)}`}>
                      {log.userType}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {log.entity}
                  {log.entityId && (
                    <span className="text-gray-500 text-xs ml-1">#{log.entityId}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {log.ipAddress || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {log.changes && (
                    <details className="cursor-pointer">
                      <summary className="text-lamaPurple hover:text-lamaPurpleLight">
                        View Changes
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No audit logs found
        </div>
      )}
    </div>
  );
}
