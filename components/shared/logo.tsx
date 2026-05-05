import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/constants/values";
import { cn } from "@/lib/utils";

/** Icon is sized to sit closer to the Cherry Bomb wordmark cap height (not tiny vs text). */
const SIZE = {
  xs: { imgPx: 32, imgClass: "size-9", text: "text-lg leading-none" },
  sm: { imgPx: 44, imgClass: "size-12", text: "text-3xl leading-none" },
  md: { imgPx: 56, imgClass: "size-14", text: "text-4xl leading-none" },
  lg: { imgPx: 64, imgClass: "size-16", text: "text-5xl leading-none" },
} as const;

interface LogoProps {
  className?: string;
  size?: keyof typeof SIZE;
  variant?: "full" | "icon";
  href?: string;
}

const Logo = ({ className, size = "md", variant = "full", href = "/" }: LogoProps) => {
  const sizes = SIZE[size];
  const wordmark = APP_NAME.toLowerCase();

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2", className)}
      aria-label={APP_NAME}
    >
      <span className="relative inline-flex shrink-0 overflow-hidden rounded-md">
        <Image
          src="/temino_logo_icon.png"
          alt="Logo"
          width={sizes.imgPx}
          height={sizes.imgPx}
          className={cn("object-contain", sizes.imgClass)}
          priority={false}
        />
      </span>
      {variant === "full" && (
        <span className={cn("font-wordmark text-primary -mt-1 uppercase", sizes.text)}>
          {wordmark}
        </span>
      )}
    </Link>
  );
};

export default Logo;
