import * as React from 'react';
import './styles.css';

interface CollapseProps {
  defaultActiveKeys?: string[];
  onChange?: (keys: string[]) => void;
  accordion?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface PanelProps {
  header: React.ReactNode;
  panelKey: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onHeaderClick?: () => void;
}

export const Collapse: React.FC<CollapseProps> & { Panel: React.FC<PanelProps> } = ({
  defaultActiveKeys = [],
  onChange,
  accordion = false,
  children,
  className = ''
}) => {
  const [activeKeys, setActiveKeys] = React.useState(defaultActiveKeys);

  const handlePanelClick = (key: string) => {
    let newActiveKeys: string[];
    
    if (accordion) {
      newActiveKeys = activeKeys.includes(key) ? [] : [key];
    } else {
      newActiveKeys = activeKeys.includes(key)
        ? activeKeys.filter(k => k !== key)
        : [...activeKeys, key];
    }

    setActiveKeys(newActiveKeys);
    onChange?.(newActiveKeys);
  };

  return (
    <div className={`collapse ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement<PanelProps>(child)) {
          const isActive = activeKeys.includes(child.props.panelKey);
          return React.cloneElement(child, {
            ...child.props,
            isActive,
            onHeaderClick: () => handlePanelClick(child.props.panelKey)
          });
        }
        return null;
      })}
    </div>
  );
};

const Panel: React.FC<PanelProps> = ({ 
  header, 
  children, 
  className = '', 
  isActive = false, 
  onHeaderClick 
}) => (
  <div className={`collapse-panel ${isActive ? 'active' : ''} ${className}`}>
    <div className="panel-header" onClick={onHeaderClick}>
      {header}
      <span className="panel-arrow" />
    </div>
    {isActive && <div className="panel-content">{children}</div>}
  </div>
);

Collapse.Panel = Panel; 