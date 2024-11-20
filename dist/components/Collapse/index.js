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
exports.Collapse = void 0;
const React = __importStar(require("react"));
require("./styles.css");
const Collapse = ({ defaultActiveKeys = [], onChange, accordion = false, children, className = '' }) => {
    const [activeKeys, setActiveKeys] = React.useState(defaultActiveKeys);
    const handlePanelClick = (key) => {
        let newActiveKeys;
        if (accordion) {
            newActiveKeys = activeKeys.includes(key) ? [] : [key];
        }
        else {
            newActiveKeys = activeKeys.includes(key)
                ? activeKeys.filter(k => k !== key)
                : [...activeKeys, key];
        }
        setActiveKeys(newActiveKeys);
        onChange === null || onChange === void 0 ? void 0 : onChange(newActiveKeys);
    };
    return (<div className={`collapse ${className}`}>
      {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                const isActive = activeKeys.includes(child.props.panelKey);
                return React.cloneElement(child, Object.assign(Object.assign({}, child.props), { isActive, onHeaderClick: () => handlePanelClick(child.props.panelKey) }));
            }
            return null;
        })}
    </div>);
};
exports.Collapse = Collapse;
const Panel = ({ header, children, className = '', isActive = false, onHeaderClick }) => (<div className={`collapse-panel ${isActive ? 'active' : ''} ${className}`}>
    <div className="panel-header" onClick={onHeaderClick}>
      {header}
      <span className="panel-arrow"/>
    </div>
    {isActive && <div className="panel-content">{children}</div>}
  </div>);
exports.Collapse.Panel = Panel;
