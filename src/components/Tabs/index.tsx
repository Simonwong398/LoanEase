import * as React from 'react';
import './styles.css';

interface TabsProps {
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabPaneProps {
  tab: React.ReactNode;
  tabKey: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> & { TabPane: React.FC<TabPaneProps> } = ({
  defaultActiveKey,
  onChange,
  children,
  className = ''
}) => {
  const [activeKey, setActiveKey] = React.useState(defaultActiveKey);

  const handleTabClick = (key: string) => {
    setActiveKey(key);
    onChange?.(key);
  };

  const tabs = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return {
        key: child.props.tabKey,
        tab: child.props.tab,
        content: child.props.children
      };
    }
    return null;
  });

  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-nav">
        {tabs?.map(tab => (
          <div
            key={tab?.key}
            className={`tab-nav-item ${tab?.key === activeKey ? 'active' : ''}`}
            onClick={() => tab?.key && handleTabClick(tab.key)}
          >
            {tab?.tab}
          </div>
        ))}
      </div>
      <div className="tabs-content">
        {tabs?.find(tab => tab?.key === activeKey)?.content}
      </div>
    </div>
  );
};

Tabs.TabPane = ({ children, className = '' }) => (
  <div className={`tab-pane ${className}`}>{children}</div>
); 