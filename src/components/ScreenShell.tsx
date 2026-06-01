import { TabBar } from './TabBar';
import styles from './ScreenShell.module.css';

interface ScreenShellProps {
  children: React.ReactNode;
  showTabs?: boolean;
}

export function ScreenShell({ children, showTabs = true }: ScreenShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
      {showTabs && <TabBar />}
    </div>
  );
}
