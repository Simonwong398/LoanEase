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
exports.Card = void 0;
const React = __importStar(require("react"));
require("./styles.css");
const Card = ({ title, subtitle, actions, children, className = '', hoverable = false, bordered = true, loading = false, }) => {
    return (<div className={`
        card 
        ${hoverable ? 'hoverable' : ''} 
        ${bordered ? 'bordered' : ''} 
        ${loading ? 'loading' : ''} 
        ${className}
      `}>
      {(title || subtitle || actions) && (<div className="card-header">
          <div className="card-header-content">
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>)}
      <div className="card-content">
        {loading ? (<div className="card-skeleton">
            <div className="skeleton-line"/>
            <div className="skeleton-line"/>
            <div className="skeleton-line"/>
          </div>) : (children)}
      </div>
    </div>);
};
exports.Card = Card;
exports.Card.displayName = 'Card';
