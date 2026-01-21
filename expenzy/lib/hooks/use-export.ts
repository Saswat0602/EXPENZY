import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { exportGroupReport, exportExpenses, exportTransactions, downloadExportedFile } from '@/lib/api/export';
import type { ExportGroupOptions, ExportExpenseOptions, ExportTransactionOptions } from '@/types/export';

/**
 * Hook to export group report as PDF
 */
export function useExportGroupReport() {
    return useMutation({
        mutationFn: async (options: ExportGroupOptions) => {
            const response = await exportGroupReport(options);
            // Automatically download the file
            await downloadExportedFile(response.filename);
            return response;
        },
        onSuccess: () => {
            toast.success('Group report exported successfully');
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to export group report';
            toast.error(message);
        },
    });
}

/**
 * Hook to export personal expenses as PDF
 */
export function useExportExpenses() {
    return useMutation({
        mutationFn: async (options?: ExportExpenseOptions) => {
            const response = await exportExpenses(options);
            // Automatically download the file
            await downloadExportedFile(response.filename);
            return response;
        },
        onSuccess: () => {
            toast.success('Expenses exported successfully');
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to export expenses';
            toast.error(message);
        },
    });
}

/**
 * Hook to export transactions as PDF
 */
export function useExportTransactions() {
    return useMutation({
        mutationFn: async (options?: ExportTransactionOptions) => {
            const response = await exportTransactions(options);
            // Automatically download the file
            await downloadExportedFile(response.filename);
            return response;
        },
        onSuccess: () => {
            toast.success('Transactions exported successfully');
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to export transactions';
            toast.error(message);
        },
    });
}
