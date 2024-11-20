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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyImage = void 0;
const React = __importStar(require("react"));
require("./styles.css");
const LazyImage = (_a) => {
    var { src, fallback = '', threshold = 0.1, effect = 'blur', alt = '', className = '' } = _a, props = __rest(_a, ["src", "fallback", "threshold", "effect", "alt", "className"]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);
    const imgRef = React.useRef(null);
    React.useEffect(() => {
        const currentImg = imgRef.current;
        if (!currentImg)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && currentImg) {
                currentImg.setAttribute('src', src);
                observer.unobserve(currentImg);
            }
        }, { threshold });
        observer.observe(currentImg);
        return () => {
            if (currentImg) {
                observer.unobserve(currentImg);
            }
        };
    }, [src, threshold]);
    return (<img ref={imgRef} src={fallback} alt={alt} className={`
        lazy-image 
        ${effect !== 'none' ? `effect-${effect}` : ''} 
        ${isLoaded ? 'loaded' : ''} 
        ${className}
      `} onLoad={() => setIsLoaded(true)} onError={() => setError(true)} {...props}/>);
};
exports.LazyImage = LazyImage;
