import css from './TickerContent.module.css';

export default function TickerContent({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <span key={i}>
          <span className={css.cat}>{item.cat}:</span>
          {' '}
          <span className={css.text}>{item.text}</span>
          <span className={css.separator}>✦</span>
        </span>
      ))}
    </>
  );
}
