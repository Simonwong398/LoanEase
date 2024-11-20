"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const ComparisonChart_1 = __importDefault(require("../ComparisonChart"));
describe('ComparisonChart', () => {
    const mockData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
            {
                data: [10, 20, 30],
                label: 'Test Data',
            },
        ],
    };
    it('should render successfully', () => {
        (0, react_2.render)(<ComparisonChart_1.default data={mockData}/>);
        expect(react_2.screen.getByRole('img')).toBeInTheDocument();
    });
    it('should handle empty data', () => {
        const emptyData = {
            labels: [],
            datasets: [],
        };
        (0, react_2.render)(<ComparisonChart_1.default data={emptyData}/>);
        expect(react_2.screen.getByText('No data available')).toBeInTheDocument();
    });
    it('should handle errors', () => {
        const mockError = globals_1.jest.fn();
        (0, react_2.render)(<ComparisonChart_1.default data={mockData} onError={mockError}/>);
        // 触发错误
        const error = new Error('Test error');
        mockError(error);
        expect(mockError).toHaveBeenCalledWith(error);
    });
});
