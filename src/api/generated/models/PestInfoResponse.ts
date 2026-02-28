/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PestCategoryEnum } from './PestCategoryEnum';
import type { PreventionSchemeResponse } from './PreventionSchemeResponse';
export type PestInfoResponse = {
    name: string;
    category: PestCategoryEnum;
    affected_part?: (string | null);
    symptom_description?: (string | null);
    peak_season?: (string | null);
    typical_image?: (string | null);
    id: number;
    prevention_schemes?: Array<PreventionSchemeResponse>;
};

