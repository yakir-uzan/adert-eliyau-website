import styles from './GoldTrails.module.css';

export default function GoldTrails() {
  return (
    <div className={styles.root}>
      <div className={`${styles.trail} ${styles.trailOuter}`} />
      <div className={`${styles.trail} ${styles.trailMiddle}`} />
      <div className={`${styles.trail} ${styles.trailInner}`} />
    </div>
  );
}
