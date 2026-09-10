import { Link } from "react-router-dom";
import styles from "./Button.module.css";

export default function Button({
  children,
  to,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}) {
  const classes = `${styles.button} ${styles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
