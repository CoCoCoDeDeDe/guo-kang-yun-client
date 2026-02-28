/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GovernanceStatusEnum } from './GovernanceStatusEnum';
export type GovernanceRecordCreate = {
    pest_type: string;
    found_time: string;
    location?: (string | null);
    status?: GovernanceStatusEnum;
    description?: (string | null);
    photos?: (Array<string> | null);
};

