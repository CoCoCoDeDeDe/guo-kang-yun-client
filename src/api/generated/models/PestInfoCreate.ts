/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PestCategoryEnum } from './PestCategoryEnum';
export type PestInfoCreate = {
    name: string;
    category: PestCategoryEnum;
    affected_part?: (string | null);
    symptom_description?: (string | null);
    peak_season?: (string | null);
    typical_image?: (string | null);
};

