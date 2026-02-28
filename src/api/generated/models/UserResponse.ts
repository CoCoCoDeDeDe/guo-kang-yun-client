/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
export type UserResponse = {
    email: string;
    username: string;
    role?: RoleEnum;
    phone?: (string | null);
    is_verified?: number;
    id: number;
    create_at: string;
};

