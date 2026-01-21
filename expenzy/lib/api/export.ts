import { apiClient } from './client';
import type { ExportResponse, ExportGroupOptions, ExportExpenseOptions, ExportTransactionOptions } from '@/types/export';

const EXPORT_BASE = '/export';

/**
 * Export group report as PDF
 */
export async function exportGroupReport(options: ExportGroupOptions): Promise<ExportResponse> {
    const { groupId, ...params } = options;
    return await apiClient.post<ExportResponse>(
        `${EXPORT_BASE}/group/${groupId}`,
        params
    );
}

/**
 * Export personal expenses as PDF
 */
export async function exportExpenses(options?: ExportExpenseOptions): Promise<ExportResponse> {
    return await apiClient.post<ExportResponse>(
        `${EXPORT_BASE}/expenses`,
        options || {}
    );
}

/**
 * Export transactions (income + expenses) as PDF
 */
export async function exportTransactions(options?: ExportTransactionOptions): Promise<ExportResponse> {
    return await apiClient.post<ExportResponse>(
        `${EXPORT_BASE}/transactions`,
        options || {}
    );
}

/**
 * Get download URL for exported file
 */
export function getDownloadUrl(filename: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}${EXPORT_BASE}/download/${filename}`;
}

/**
 * Download exported file with authentication
 */
export async function downloadExportedFile(filename: string): Promise<void> {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const url = `${baseUrl}${EXPORT_BASE}/download/${filename}`;

        // Fetch with authentication
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        // Get the blob
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}
