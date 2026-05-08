import logo from "@/assets/logo.jpg";

interface MooringImagePlaceholderProps {
  name: string;
  className?: string;
}

const MooringImagePlaceholder = ({ name, className = "" }: MooringImagePlaceholderProps) => (
  <div
    className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] via-[#1e5a8a] to-[#0c2d48] ${className}`}
    aria-label={name}
  >
    <img
      src={logo}
      alt="Mooring Booking"
      className="w-24 h-24 object-contain opacity-60"
      draggable={false}
    />
  </div>
);

export default MooringImagePlaceholder;
