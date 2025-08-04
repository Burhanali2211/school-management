import { redirect } from "next/navigation";
import { getCurrentUser, validateSession } from "@/lib/auth-service";

const HomePage = async () => {
  try {
    // Try to get current user session
    const session = await validateSession();
    
    if (session) {
      // Redirect based on user type
      switch (session.userType) {
        case "ADMIN":
          redirect("/admin");
          break;
        case "TEACHER":
          redirect("/teacher");
          break;
        case "STUDENT":
          redirect("/student");
          break;
        case "PARENT":
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
