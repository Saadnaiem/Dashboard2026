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
export const fetchSalesFromSupabase = async (onProgress: (message: string) => void): Promise<FetchResult> => {
    try {
        onProgress('Initializing Supabase client connection...');
        const CHUNK_SIZE = 1000; // Supabase/PostgREST standard row query limit threshold
        let lastId = 0;
        let allRecords: any[] = [];
        let hasMoreData = true;
        let chunkIndex = 1;

        // Perform parallel fetching configuration or sequential O(log N) keyset batch loading
        while (hasMoreData) {
            onProgress(`Downloading records from Supabase [Batch ${chunkIndex}]...`);

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

            if (data.length < CHUNK_SIZE) {
                // If returned rows is less than limit, there is no more data left in remote tables
                hasMoreData = false;
            } else {
                chunkIndex++;
            }
        }

        if (allRecords.length === 0) {
            return {
                data: null,
                error: 'The "sales" table is currently empty in Supabase. Please load rows using CSV upload or manual scripts.'
            };
        }

        // Map column keys dynamically using normalizeRow helper.
        // This is 100% immune to casing styling differences (works with lowercase division or UPPERCASE DIVISION!)
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
