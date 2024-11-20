"use strict";
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
const globals_1 = require("@jest/globals");
const index_1 = require("../index");
describe('RouterManager', () => {
    const mockRoutes = [
        {
            path: '/home',
            name: 'home',
            component: () => null,
        },
        {
            path: '/users',
            name: 'users',
            component: () => null,
            children: [
                {
                    path: '/:id',
                    name: 'user-detail',
                    component: () => null,
                },
            ],
        },
    ];
    beforeEach(() => {
        index_1.routerManager.dispose();
        index_1.routerManager.registerRoutes(mockRoutes);
    });
    it('should register routes correctly', () => {
        expect(index_1.routerManager.getCurrentRoute()).toBeNull();
        expect(index_1.routerManager.getState().stack).toHaveLength(0);
    });
    it('should navigate to route', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const result = yield index_1.routerManager.navigate('/home');
        expect(result).toBe(true);
        expect((_a = index_1.routerManager.getCurrentRoute()) === null || _a === void 0 ? void 0 : _a.path).toBe('/home');
    }));
    it('should handle params in navigation', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield index_1.routerManager.navigate('/users/:id', { id: 1 });
        expect(result).toBe(true);
        expect(index_1.routerManager.getState().params).toEqual({ id: 1 });
    }));
    it('should handle middleware', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const middleware = globals_1.jest.fn().mockImplementation(() => Promise.resolve(true));
        index_1.routerManager.use(middleware);
        yield index_1.routerManager.navigate('/home');
        expect((_a = index_1.routerManager.getState().currentRoute) === null || _a === void 0 ? void 0 : _a.path).toBe('/home');
    }));
});
