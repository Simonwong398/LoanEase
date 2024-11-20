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
exports.ProgressBar = void 0;
const React = __importStar(require("react"));
require("./ProgressBar.css");
const ProgressBar = ({ progress, color = 'var(--color-primary)', height = 4, showLabel = false, animated = true }) => {
    const progressValue = Math.min(100, Math.max(0, progress));
    return (<div className={`
        progress-container 
        progress-height-${height}
        ${color !== 'var(--color-primary)' ? 'progress-custom-color' : ''}
      `} data-color={color} data-progress={progressValue}>
      <div className={`progress-bar ${animated ? 'animated' : ''}`}/>
      {showLabel && (<span className="progress-label">{Math.round(progressValue)}%</span>)}
    </div>);
};
exports.ProgressBar = ProgressBar;
