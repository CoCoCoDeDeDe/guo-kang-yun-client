/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GovernanceStatusEnum } from './GovernanceStatusEnum';
export type GovernanceRecordUpdate = {
    pest_type?: (string | null);
    found_time?: (string | null);
    location?: (string | null);
    status?: (GovernanceStatusEnum | null);
    description?: (string | null);
    photos?: (Array<string> | null);
};

