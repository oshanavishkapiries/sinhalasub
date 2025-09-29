import { cn } from "@/lib/utils";
import Image from "next/image";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Image className={cn("logo", className)} src="/logo.png" width={100} height={100} alt="logo" /> 
  );
};
