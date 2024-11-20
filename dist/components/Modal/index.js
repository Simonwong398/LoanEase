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
exports.Modal = void 0;
const React = __importStar(require("react"));
require("./styles.css");
const Modal = ({ open, onClose, title, children, footer, className = '', closeOnOverlayClick = true, closeOnEscape = true, size = 'medium', }) => {
    React.useEffect(() => {
        const handleEscape = (event) => {
            if (closeOnEscape && event.key === 'Escape') {
                onClose();
            }
        };
        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [open, closeOnEscape, onClose]);
    if (!open)
        return null;
    return (<div className="modal-overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div className={`modal modal-${size} ${className}`} onClick={e => e.stopPropagation()}>
        {title && (<div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>)}
        <div className="modal-content">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>);
};
exports.Modal = Modal;
exports.Modal.displayName = 'Modal';
