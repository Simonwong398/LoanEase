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
exports.DefaultDocumentService = void 0;
class DefaultDocumentService {
    validateDocument(documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现文档验证逻辑
            return true;
        });
    }
    getDocumentById(documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现文档获取逻辑
            return null;
        });
    }
}
exports.DefaultDocumentService = DefaultDocumentService;
