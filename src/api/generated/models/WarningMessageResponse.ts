/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WarningLevelEnum } from './WarningLevelEnum';
export type WarningMessageResponse = {
    level?: WarningLevelEnum;
    affected_scope: string;
    prevention_measures: string;
    expire_time: string;
    id: number;
    publish_time: string;
};

