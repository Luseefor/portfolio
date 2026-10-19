import styles from './portfolio.module.css';

/** Keep metrics and unfinished measurements as selectable text in the paper's mono face. */
export default function PaperText({ text }: { text: string }) {
  return text.split(/(TODO\(metric\):|\d+(?:[.,]\d+)*(?:%|\+)?)/g).map((part, index) => {
    if (part === 'TODO(metric):') {
      return (
        <span key={index} data-paper-todo className={styles.todo}>
          {part}
        </span>
      );
    }
    if (/^\d/.test(part)) {
      return (
        <span key={index} data-paper-metric className={styles.metric}>
          {part}
        </span>
      );
    }
    return part;
  });
}
