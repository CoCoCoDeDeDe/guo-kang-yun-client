/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PasswordResetConfirm = {
    /**
     * 需要重置密码的邮箱
     */
    email: string;
    /**
     * 6位验证码
     */
    code: string;
    /**
     * 新密码，至少6位
     */
    new_password: string;
};

