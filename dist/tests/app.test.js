"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
describe('GET /', () => {
    it('should return Hello World!', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Hello World!');
    });
});
