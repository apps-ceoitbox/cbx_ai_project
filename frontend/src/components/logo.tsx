import { Link } from "react-router-dom";

interface LogoProps {
  className?: string
  width?: number
  height?: number
  size: string
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16"
  };

  return (
    <>
      <Link to="/">
        <div className={`flex items-center gap-3 ${className}`}>
          <img
            draggable="false"
            src="/logo.png"
            alt="CEOITBOX Logo"
            className={`${sizeClasses[size]} w-auto`}
          />
          <div
            className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl text-primary-red"
            style={{ letterSpacing: "0.03em" }}
          >
            CEOITBOX AI
          </div>

        </div>
      </Link>
    </>
  )
}

