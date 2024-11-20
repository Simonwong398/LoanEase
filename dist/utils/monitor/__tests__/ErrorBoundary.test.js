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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_2 = require("@testing-library/react");
const globals_1 = require("@jest/globals");
const index_1 = require("../index");
require("@testing-library/jest-dom");
// 测试组件
const ThrowError = ({ message = 'Test error' }) => {
    throw new Error(message);
};
const AsyncThrowError = () => {
    (0, react_1.useEffect)(() => {
        throw new Error('Async error');
    }, []);
    return <div>Loading...</div>;
};
const EventThrowError = () => {
    const handleClick = () => {
        throw new Error('Event error');
    };
    return <button onClick={handleClick}>Trigger Error</button>;
};
const StateThrowError = () => {
    const [shouldThrow, setShouldThrow] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (shouldThrow) {
            throw new Error('State error');
        }
    }, [shouldThrow]);
    return <button onClick={() => setShouldThrow(true)}>Trigger State Error</button>;
};
(0, globals_1.describe)('ErrorBoundary', () => {
    let consoleError;
    (0, globals_1.beforeEach)(() => {
        consoleError = globals_1.jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        consoleError.mockRestore();
    });
    (0, globals_1.describe)('Basic Error Handling', () => {
        (0, globals_1.it)('should catch render errors', () => {
            const handleError = globals_1.jest.fn();
            const fallback = <div>Error occurred</div>;
            (0, react_2.render)(<index_1.ErrorBoundary fallback={fallback} onError={handleError}>
          <ThrowError />
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(react_2.screen.getByText('Error occurred')).toBeInTheDocument();
            (0, globals_1.expect)(handleError).toHaveBeenCalled();
        });
        (0, globals_1.it)('should pass error details to fallback component', () => {
            const ErrorFallback = ({ error }) => (<div>Error: {error.message}</div>);
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<ErrorFallback error={new Error('')}/>}>
          <ThrowError message="Custom error message"/>
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(react_2.screen.getByText('Error: Custom error message')).toBeInTheDocument();
        });
    });
    (0, globals_1.describe)('Async Error Handling', () => {
        (0, globals_1.it)('should catch async errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const handleError = globals_1.jest.fn();
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>Async error occurred</div>} onError={handleError}>
          <AsyncThrowError />
        </index_1.ErrorBoundary>);
            // Wait for async error
            yield (0, react_2.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield new Promise(resolve => setTimeout(resolve, 0));
            }));
            (0, globals_1.expect)(react_2.screen.getByText('Async error occurred')).toBeInTheDocument();
            (0, globals_1.expect)(handleError).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should handle event handler errors', () => {
            const handleError = globals_1.jest.fn();
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>Event error occurred</div>} onError={handleError}>
          <EventThrowError />
        </index_1.ErrorBoundary>);
            react_2.fireEvent.click(react_2.screen.getByText('Trigger Error'));
            (0, globals_1.expect)(react_2.screen.getByText('Event error occurred')).toBeInTheDocument();
            (0, globals_1.expect)(handleError).toHaveBeenCalled();
        });
        (0, globals_1.it)('should handle state update errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const handleError = globals_1.jest.fn();
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>State error occurred</div>} onError={handleError}>
          <StateThrowError />
        </index_1.ErrorBoundary>);
            react_2.fireEvent.click(react_2.screen.getByText('Trigger State Error'));
            yield (0, react_2.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield new Promise(resolve => setTimeout(resolve, 0));
            }));
            (0, globals_1.expect)(react_2.screen.getByText('State error occurred')).toBeInTheDocument();
            (0, globals_1.expect)(handleError).toHaveBeenCalled();
        }));
    });
    (0, globals_1.describe)('Nested Error Boundaries', () => {
        (0, globals_1.it)('should contain errors to nearest boundary', () => {
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>Outer error</div>}>
          <div>
            <index_1.ErrorBoundary fallback={<div>Inner error</div>}>
              <ThrowError />
            </index_1.ErrorBoundary>
          </div>
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(react_2.screen.getByText('Inner error')).toBeInTheDocument();
            (0, globals_1.expect)(react_2.screen.queryByText('Outer error')).not.toBeInTheDocument();
        });
        (0, globals_1.it)('should handle multiple errors in different boundaries', () => {
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>Outer error</div>}>
          <div>
            <index_1.ErrorBoundary fallback={<div>Error 1</div>}>
              <ThrowError message="Error 1"/>
            </index_1.ErrorBoundary>
            <index_1.ErrorBoundary fallback={<div>Error 2</div>}>
              <ThrowError message="Error 2"/>
            </index_1.ErrorBoundary>
          </div>
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(react_2.screen.getByText('Error 1')).toBeInTheDocument();
            (0, globals_1.expect)(react_2.screen.getByText('Error 2')).toBeInTheDocument();
            (0, globals_1.expect)(react_2.screen.queryByText('Outer error')).not.toBeInTheDocument();
        });
    });
    (0, globals_1.describe)('Recovery and Reset', () => {
        (0, globals_1.it)('should reset error boundary when children change', () => {
            const { rerender } = (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>Error occurred</div>}>
          <ThrowError />
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(react_2.screen.getByText('Error occurred')).toBeInTheDocument();
            rerender(<index_1.ErrorBoundary fallback={<div>Error occurred</div>}>
          <div>New content</div>
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(react_2.screen.getByText('New content')).toBeInTheDocument();
        });
        (0, globals_1.it)('should support retry functionality', () => {
            const RetryFallback = ({ reset }) => (<button onClick={reset}>Retry</button>);
            const { rerender } = (0, react_2.render)(<index_1.ErrorBoundary fallback={<RetryFallback reset={() => { }}/>}>
          <ThrowError />
        </index_1.ErrorBoundary>);
            react_2.fireEvent.click(react_2.screen.getByText('Retry'));
            rerender(<index_1.ErrorBoundary fallback={<RetryFallback reset={() => { }}/>}>
          <div>Recovered content</div>
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(react_2.screen.getByText('Recovered content')).toBeInTheDocument();
        });
    });
    (0, globals_1.describe)('Error Reporting', () => {
        (0, globals_1.it)('should provide error details to error handler', () => {
            const handleError = globals_1.jest.fn();
            const errorMessage = 'Detailed error message';
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>Error occurred</div>} onError={handleError}>
          <ThrowError message={errorMessage}/>
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(handleError).toHaveBeenCalledWith(globals_1.expect.objectContaining({
                message: errorMessage
            }), globals_1.expect.any(Object));
        });
        (0, globals_1.it)('should include component stack in error info', () => {
            const handleError = globals_1.jest.fn();
            (0, react_2.render)(<index_1.ErrorBoundary fallback={<div>Error occurred</div>} onError={handleError}>
          <ThrowError />
        </index_1.ErrorBoundary>);
            (0, globals_1.expect)(handleError).toHaveBeenCalledWith(globals_1.expect.any(Error), globals_1.expect.objectContaining({
                componentStack: globals_1.expect.any(String)
            }));
        });
    });
});
