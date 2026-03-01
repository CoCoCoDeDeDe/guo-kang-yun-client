/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
export type UserCreate = {
    email: string;
    username: string;
    role?: RoleEnum;
    phone?: (string | null);
    is_verified?: number;
    /**
     * 密码，至少6位，明文密码，后端需哈希处理
     */
    password: string;
    /**
     * 6位邮箱验证码
     */
    code: string;
};

