import { supabase } from './supabaseClient';
import { RawSalesDataRow } from '../types';

export interface FetchResult {
    data: RawSalesDataRow[] | null;
    error: string | null;
}

/**
 * Fetches all sales records from Supabase in optimized paginated chunks.
 * Uses client-side keyset pagination (sorting by ID and using .gt('id', lastId))
 * which scales as O(log N) rather than standard unindexed offsets.
 */
export const fetchSalesFromSupabase = async (
    onProgress: (status: { 
        stage: 'init' | 'fetching' | 'processing';
        loadedRows: number; 
        totalRows: number | null;
        elapsedSeconds?: number;
        estimatedRemainingSeconds?: number | null;
        message: string;
    }) => void
): Promise<FetchResult> => {
    try {
        onProgress({ stage: 'init', loadedRows: 0, totalRows: null, message: 'Initializing Supabase connection...' });
        
        // 1. Get the total count of rows first to construct highly precise interactive progress indicators!
        const { count, error: countError } = await supabase
            .from('sales')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error("Supabase count query warning:", countError);
        }
        
        const totalCount = count || 0;
        const CHUNK_SIZE = 50000; 
        
        let lastId = 0;
        let allRecords: any[] = [];
        let hasMoreData = true;
        let chunkIndex = 1;

        const startTime = Date.now();

        // Perform parallel fetching configuration or sequential O(log N) keyset batch loading
        while (hasMoreData) {
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            
            // Calculate ETA math based on records downloaded per second so far
            let estimatedRemainingSeconds: number | null = null;
            if (allRecords.length > 0 && totalCount > allRecords.length) {
                const rowsPerSecond = allRecords.length / elapsedSeconds;
                estimatedRemainingSeconds = Math.max(0, (totalCount - allRecords.length) / rowsPerSecond);
            }

            onProgress({
                stage: 'fetching',
                loadedRows: allRecords.length,
                totalRows: totalCount,
                elapsedSeconds: Math.round(elapsedSeconds),
                estimatedRemainingSeconds: estimatedRemainingSeconds ? Math.ceil(estimatedRemainingSeconds) : null,
                message: `Downloading dataset from Supabase...`
            });

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .gt('id', lastId)
                .order('id', { ascending: true })
                .limit(CHUNK_SIZE);

            if (error) {
                console.error("Supabase request error:", error);
                throw new Error(error.message);
            }

            if (!data || data.length === 0) {
                hasMoreData = false;
                break;
            }

            allRecords = allRecords.concat(data);
            
            // Keyset advance
            const lastItem = data[data.length - 1];
            lastId = lastItem.id;
            chunkIndex++;
        }

        if (allRecords.length === 0) {
            return {
                data: null,
                error: 'The "sales" table is currently empty in Supabase. Please load rows using CSV upload or manual scripts.'
            };
        }

        onProgress({
            stage: 'processing',
            loadedRows: allRecords.length,
            totalRows: totalCount,
            message: 'Parsing and matching column naming styles...'
        });

        // Map column keys dynamically using normalizeRow helper.
        const { normalizeRow } = await import('./dataProcessor');
        const standardizedData: RawSalesDataRow[] = allRecords.map(item => {
            const rawKeys = Object.keys(item);
            return normalizeRow(item, rawKeys);
        });

        return { data: standardizedData, error: null };
    } catch (err: any) {
        console.error("Fetch sales from Supabase failed:", err);
        return {
            data: null,
            error: `Failed to download records from Supabase: ${err.message}. Ensure your table and columns are configured as spec, and try again.`
        };
    }
};
