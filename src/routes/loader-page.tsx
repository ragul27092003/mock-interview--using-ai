import { cn } from "@/lib/utils";
import {  UserRoundSearch } from "lucide-react";

export const LoaderPage = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-screen h-screen flex items-center  bg-transparent justify-center  z-50",
        className
      )}
    >
      <UserRoundSearch className="w-20 h-30 min-w-30 min-h-40 animate-pulse "/>
      
    </div>
  );
};
export default LoaderPage