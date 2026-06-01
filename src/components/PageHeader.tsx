import { useNavigate } from 'react-router-dom';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  backTo?: string;
}

export function PageHeader({ title, backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      {backTo && (
        <button className={styles.back} onClick={() => navigate(backTo)}>
          &#x2190;
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.spacer} />
    </header>
  );
}
