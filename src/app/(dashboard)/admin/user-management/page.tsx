import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

const UserManagementPage = async () => {
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-primary-100 text-lg">
            Create and manage teacher and student accounts
          </p>
        </div>
      </div>

      {/* FEATURES OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100">
          <h2 className="text-xl font-semibold mb-4 text-primary-900">Teacher Management</h2>
          <p className="text-gray-600 mb-4">
            Create and assign credentials to teachers with auto-generated usernames, emails, and passwords.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li>• Auto-generate usernames and emails</li>
            <li>• Secure password generation</li>
            <li>• Complete profile information</li>
            <li>• Subject and class assignments</li>
          </ul>
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg">
            Create Teacher
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-accent-100">
          <h2 className="text-xl font-semibold mb-4 text-accent-900">Student Management</h2>
          <p className="text-gray-600 mb-4">
            Create and assign credentials to students with auto-generated usernames, emails, and passwords.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li>• Auto-generate usernames and emails</li>
            <li>• Secure password generation</li>
            <li>• Complete profile information</li>
            <li>• Grade and class assignments</li>
          </ul>
          <button className="w-full bg-accent-600 hover:bg-accent-700 text-white py-2 px-4 rounded-lg">
            Create Student
          </button>
        </div>
      </div>

      {/* FEATURES LIST */}
      <div className="bg-gradient-to-br from-white to-primary-50/30 rounded-2xl p-8 shadow-soft border border-primary-100/50">
        <h2 className="text-2xl font-bold mb-6 text-primary-900">User Management Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-800">Teacher Management</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Create teacher accounts with auto-generated credentials</li>
              <li>✓ Assign subjects and classes to teachers</li>
              <li>✓ Complete profile information management</li>
              <li>✓ Secure password generation and assignment</li>
              <li>✓ Email and username uniqueness validation</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-800">Student Management</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Create student accounts with auto-generated credentials</li>
              <li>✓ Assign grades, classes, and sections</li>
              <li>✓ Link students to parent accounts</li>
              <li>✓ Complete profile information management</li>
              <li>✓ Secure password generation and assignment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SYSTEM REQUIREMENTS */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900">System Requirements</h2>
        <p className="text-gray-600 mb-4">Information needed for user creation</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-gray-900">Required Information</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Full name (first and last)</li>
              <li>• Email address</li>
              <li>• Date of birth</li>
              <li>• Gender</li>
              <li>• Address</li>
              <li>• Blood type</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-900">Auto-Generated</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Username (name.surname1234)</li>
              <li>• Email (name.surname1234@school.edu)</li>
              <li>• Secure password (12 characters)</li>
              <li>• Unique user ID</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-900">Optional Information</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Phone number</li>
              <li>• Profile picture</li>
              <li>• Emergency contact</li>
              <li>• Medical information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 