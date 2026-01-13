/**
 * Upload API Service
 */

import { apiClient } from '../apiClient';
import { unwrapResponse } from './helpers';

export interface UploadResponse {
    url: string;
    relativePath?: string;
    filename?: string;
    size?: number;
    mimetype?: string;
}

export const uploadApi = {
    uploadFile: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient<unknown>('/upload', {
            method: 'POST',
            body: formData,
        });

        const result = unwrapResponse<UploadResponse>(response);

        if (result.relativePath) {
            return { ...result, url: result.relativePath };
        }

        return result;
    },
};
