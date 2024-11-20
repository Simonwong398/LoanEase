"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = void 0;
const React = __importStar(require("react"));
require("./styles.css");
const Tabs = ({ defaultActiveKey, onChange, children, className = '' }) => {
    var _a;
    const [activeKey, setActiveKey] = React.useState(defaultActiveKey);
    const handleTabClick = (key) => {
        setActiveKey(key);
        onChange === null || onChange === void 0 ? void 0 : onChange(key);
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
    return (<div className={`tabs ${className}`}>
      <div className="tabs-nav">
        {tabs === null || tabs === void 0 ? void 0 : tabs.map(tab => (<div key={tab === null || tab === void 0 ? void 0 : tab.key} className={`tab-nav-item ${(tab === null || tab === void 0 ? void 0 : tab.key) === activeKey ? 'active' : ''}`} onClick={() => (tab === null || tab === void 0 ? void 0 : tab.key) && handleTabClick(tab.key)}>
            {tab === null || tab === void 0 ? void 0 : tab.tab}
          </div>))}
      </div>
      <div className="tabs-content">
        {(_a = tabs === null || tabs === void 0 ? void 0 : tabs.find(tab => (tab === null || tab === void 0 ? void 0 : tab.key) === activeKey)) === null || _a === void 0 ? void 0 : _a.content}
      </div>
    </div>);
};
exports.Tabs = Tabs;
exports.Tabs.TabPane = ({ children, className = '' }) => (<div className={`tab-pane ${className}`}>{children}</div>);
