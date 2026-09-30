import { Link } from "react-router-dom";
import rapavoIcon from "../../assets/rapavo-icon.png";

export default function BrandLogo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <img src={rapavoIcon} alt="RAPAVO" className="h-8 w-auto" />
      <span className="flex flex-col leading-none">
        <span className="text-xl font-bold text-gray-900">RAPAVO</span>
        <span className="text-[9px] text-black whitespace-nowrap">
          The <span className="text-green-600">Smarter</span> Way to Property
        </span>
      </span>
    </Link>
  );
}