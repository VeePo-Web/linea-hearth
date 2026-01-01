import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const NavLink = ({
  href,
  children,
  className,
  onMouseEnter,
  onMouseLeave,
}: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <Link
      to={href}
      className={cn(
        "relative text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block group",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="relative">
        {children}
        {/* Animated underline */}
        <motion.span
          className="absolute -bottom-1 left-0 h-px bg-foreground origin-left"
          initial={{ scaleX: isActive ? 1 : 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%" }}
        />
      </span>
    </Link>
  );
};

export default NavLink;
