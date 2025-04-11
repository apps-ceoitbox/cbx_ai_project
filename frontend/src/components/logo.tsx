interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 180, height = 50 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="font-bold text-2xl text-primary-red">CEOITBOX</div>
    </div>
  )
}
