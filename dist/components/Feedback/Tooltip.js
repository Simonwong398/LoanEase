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
exports.Tooltip = void 0;
const React = __importStar(require("react"));
require("./styles.css");
const Tooltip = ({ content, position = 'top', children, delay = 200 }) => {
    const [show, setShow] = React.useState(false);
    const timer = React.useRef();
    const handleMouseEnter = () => {
        timer.current = setTimeout(() => setShow(true), delay);
    };
    const handleMouseLeave = () => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        setShow(false);
    };
    return (<div className="tooltip-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (<div className={`tooltip tooltip-${position}`}>
          {content}
        </div>)}
    </div>);
};
exports.Tooltip = Tooltip;
