import * as React from 'react';
import './styles.css';

interface LayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  sidebarPosition?: 'left' | 'right';
  sidebarCollapsed?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  header,
  sidebar,
  footer,
  children,
  className = '',
  sidebarPosition = 'left',
  sidebarCollapsed = false,
}) => {
  return (
    <div className={`layout ${className}`}>
      {header && <header className="layout-header">{header}</header>}
      <div className={`layout-container sidebar-${sidebarPosition} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {sidebar && (
          <aside className="layout-sidebar">
            <div className="sidebar-content">
              {sidebar}
            </div>
          </aside>
        )}
        <main className="layout-main">
          {children}
        </main>
      </div>
      {footer && <footer className="layout-footer">{footer}</footer>}
    </div>
  );
};

Layout.displayName = 'Layout';

// 子组件用于更灵活的布局
export const LayoutHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`layout-header ${className}`}>{children}</div>
);

export const LayoutSidebar: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`layout-sidebar ${className}`}>{children}</div>
);

export const LayoutContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`layout-content ${className}`}>{children}</div>
);

export const LayoutFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`layout-footer ${className}`}>{children}</div>
); 