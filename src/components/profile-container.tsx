import { useAuth, UserButton } from "@clerk/clerk-react";
import { CircleIcon, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const ProfileContainer = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center">
        <CircleIcon className="min-w-4 min-h-4 animate-spin text-green-900" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <Link to={"/signin"}>
          <Button size={"lg"}><Zap/>Dive In</Button>
        </Link>
      )}
    </div>
  );
};