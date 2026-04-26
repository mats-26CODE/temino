import React from "react";
import Link from "next/link";
import { Bus } from "lucide-react";
import { APP_NAME } from "@/constants/values";
import { cn } from "@/lib/utils";

const SIZE = {
  xs: { icon: "size-5", text: "text-base" },
  sm: { icon: "size-6", text: "text-lg" },
  md: { icon: "size-8", text: "text-2xl" },
  lg: { icon: "size-10", text: "text-3xl" },
} as const;

interface LogoProps {
  className?: string;
  size?: keyof typeof SIZE;
  variant?: "full" | "icon";
  href?: string;
}

const Logo = ({ className, size = "md", variant = "full", href = "/" }: LogoProps) => {
  const sizes = SIZE[size];
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg p-1.5 shadow-sm">
        <Bus className={sizes.icon} />
      </span>
      {variant === "full" && (
        <span className={cn("font-semibold tracking-tight", sizes.text)}>{APP_NAME}</span>
      )}
    </Link>
  );
};

export default Logo;
