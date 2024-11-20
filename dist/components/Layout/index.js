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
exports.LayoutFooter = exports.LayoutContent = exports.LayoutSidebar = exports.LayoutHeader = exports.Layout = void 0;
const React = __importStar(require("react"));
require("./styles.css");
const Layout = ({ header, sidebar, footer, children, className = '', sidebarPosition = 'left', sidebarCollapsed = false, }) => {
    return (<div className={`layout ${className}`}>
      {header && <header className="layout-header">{header}</header>}
      <div className={`layout-container sidebar-${sidebarPosition} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {sidebar && (<aside className="layout-sidebar">
            <div className="sidebar-content">
              {sidebar}
            </div>
          </aside>)}
        <main className="layout-main">
          {children}
        </main>
      </div>
      {footer && <footer className="layout-footer">{footer}</footer>}
    </div>);
};
exports.Layout = Layout;
exports.Layout.displayName = 'Layout';
// 子组件用于更灵活的布局
const LayoutHeader = ({ children, className = '' }) => (<div className={`layout-header ${className}`}>{children}</div>);
exports.LayoutHeader = LayoutHeader;
const LayoutSidebar = ({ children, className = '' }) => (<div className={`layout-sidebar ${className}`}>{children}</div>);
exports.LayoutSidebar = LayoutSidebar;
const LayoutContent = ({ children, className = '' }) => (<div className={`layout-content ${className}`}>{children}</div>);
exports.LayoutContent = LayoutContent;
const LayoutFooter = ({ children, className = '' }) => (<div className={`layout-footer ${className}`}>{children}</div>);
exports.LayoutFooter = LayoutFooter;
