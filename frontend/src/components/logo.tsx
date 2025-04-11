import { Link } from "react-router-dom";

interface LogoProps {
  className?: string
  width?: number
  height?: number
  size: string
}

export function Logo({ className, size = "md", width = 180, height = 50 }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16"
  };

  return (
    <>
      <Link to="/">
        <div className={`flex items-center gap-2 ${className}`}>
          <img
            src="/logo.png"
            alt="CEOITBOX Logo"
            className={`${sizeClasses[size]} w-auto`}
          />
          <div className="font-bold text-2xl text-primary-red">CEOITBOX</div>
        </div>
      </Link>
    </>
  )
}
