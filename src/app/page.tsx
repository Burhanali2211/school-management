import { redirect } from "next/navigation";
import { getCurrentUser, validateSession } from "@/lib/auth";
import { UserType } from "@prisma/client";

const HomePage = async () => {
  try {
    // Try to get current user session
    const session = await validateSession();
    
    if (session) {
      // Redirect based on user type
      switch (session.userType) {
        case UserType.ADMIN:
          redirect("/admin");
          break;
        case UserType.TEACHER:
          redirect("/teacher");
          break;
        case UserType.STUDENT:
          redirect("/student");
          break;
        case UserType.PARENT:
          redirect("/parent");
          break;
        default:
          redirect("/sign-in");
      }
    } else {
      // No valid session, redirect to sign in
      redirect("/sign-in");
    }
  } catch (error) {
    // If there's an error with authentication, redirect to sign in
    redirect("/sign-in");
  }
};

export default HomePage;
