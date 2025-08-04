"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, EyeOff, Loader2 } from "lucide-react";

interface UserFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  phone?: string;
  address: string;
  bloodType: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  birthday: string;
}

interface UserManagementFormProps {
  type: "teacher" | "student";
}

export default function UserManagementForm({ type }: UserManagementFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    name: "",
    surname: "",
    phone: "",
    address: "",
    bloodType: "",
    sex: "MALE",
    birthday: ""
  });

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateUsername = (name: string, surname: string) => {
    const base = `${name.toLowerCase()}.${surname.toLowerCase()}`;
    const timestamp = Date.now().toString().slice(-4);
    return `${base}${timestamp}`;
  };

  const generateEmail = (name: string, surname: string) => {
    const base = `${name.toLowerCase()}.${surname.toLowerCase()}`;
    const timestamp = Date.now().toString().slice(-4);
    return `${base}${timestamp}@school.edu`;
  };

  const handleAutoGenerate = () => {
    if (!form.name || !form.surname) {
      alert("Please enter name and surname first");
      return;
    }

    const username = generateUsername(form.name, form.surname);
    const email = generateEmail(form.name, form.surname);
    const password = generatePassword();

    setForm(prev => ({
      ...prev,
      username,
      email,
      password
    }));

    alert("Auto-generated credentials");
  };

  const createUser = async () => {
    if (!form.username || !form.email || !form.password || !form.name || !form.surname) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = type === "teacher" ? "/api/teachers" : "/api/students";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      // Reset form
      setForm({
        username: "",
        email: "",
        password: "",
        name: "",
        surname: "",
        phone: "",
        address: "",
        bloodType: "",
        sex: "MALE",
        birthday: ""
      });

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      alert(`Failed to create ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const title = type === "teacher" ? "Create New Teacher" : "Create New Student";
  const description = type === "teacher" 
    ? "Add a new teacher to the system with their credentials"
    : "Add a new student to the system with their credentials";
  const buttonColor = type === "teacher" ? "bg-primary-600 hover:bg-primary-700" : "bg-accent-600 hover:bg-accent-700";
  const borderColor = type === "teacher" ? "border-primary-100" : "border-accent-100";
  const bgColor = type === "teacher" ? "bg-primary-50/50 border-primary-200" : "bg-accent-50/50 border-accent-200";
  const textColor = type === "teacher" ? "text-primary-900" : "text-accent-900";
  const buttonBorderColor = type === "teacher" ? "border-primary-300 text-primary-700 hover:bg-primary-50" : "border-accent-300 text-accent-700 hover:bg-accent-50";

  return (
    <Card className={`shadow-soft ${borderColor}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${textColor}`}>
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Auto-generate section */}
        <div className={`rounded-lg p-4 border ${bgColor}`}>
          <h4 className={`font-semibold mb-3 ${textColor}`}>Quick Setup</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="First Name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Last Name"
                value={form.surname}
                onChange={(e) => setForm(prev => ({ ...prev, surname: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleAutoGenerate}
              variant="outline"
              className={`w-full ${buttonBorderColor}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Auto-generate Credentials
            </Button>
          </div>
        </div>

        {/* Credentials section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Credentials</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder={`${type}.username`}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder={`${type}@school.edu`}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Personal Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="blood">Blood Type</Label>
              <Select
                value={form.bloodType}
                onValueChange={(value) => setForm(prev => ({ ...prev, bloodType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="sex">Gender</Label>
            <Select
              value={form.sex}
              onValueChange={(value: string) => 
                setForm(prev => ({ ...prev, sex: value as "MALE" | "FEMALE" | "OTHER" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="birthday">Date of Birth</Label>
            <Input
              id="birthday"
              type="date"
              value={form.birthday}
              onChange={(e) => setForm(prev => ({ ...prev, birthday: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter full address"
            />
          </div>
        </div>

        <Button
          onClick={createUser}
          disabled={isLoading}
          className={`w-full ${buttonColor}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Create {type.charAt(0).toUpperCase() + type.slice(1)} Account
        </Button>
      </CardBody>
    </Card>
  );
} 