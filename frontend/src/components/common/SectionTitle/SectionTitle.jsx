import styles from "./SectionTitle.module.css";

export default function SectionTitle({
  children,
  rightSlot = null,
  className = "",
}) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <h2 className={styles.title}>
        {children}
      </h2>
      {rightSlot}
    </div>
  );
}
