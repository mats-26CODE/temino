import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/constants/values";
import { cn } from "@/lib/utils";

// temino_logo.png is a horizontal wordmark (~1091x278). We constrain the height
// and let the width follow the aspect ratio.
const SIZE = {
  xs: "h-7 w-auto",
  sm: "h-9 w-auto",
  md: "h-11 w-auto",
  lg: "h-14 w-auto",
} as const;

interface LogoProps {
  className?: string;
  size?: keyof typeof SIZE;
  href?: string;
}

const Logo = ({ className, size = "md", href = "/" }: LogoProps) => {
  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label={APP_NAME}
    >
      <Image
        src="/temino_logo.png"
        alt={APP_NAME}
        width={1091}
        height={278}
        className={cn("object-contain", SIZE[size])}
        priority={false}
      />
    </Link>
  );
};

export default Logo;
