import { Telescope, Presentation, Users, GraduationCap, Building2 } from "lucide-react";
import styles from "./Icon.module.css";

const iconos = {
  Telescope,
  Presentation,
  Users,
  GraduationCap,
  Building2,
};

export default function Icon({
  name,
  className = "",
  ...props
}) {
  const LucideIcon = iconos[name];

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      className={`${styles.icon} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}