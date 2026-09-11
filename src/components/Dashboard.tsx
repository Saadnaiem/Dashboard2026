
import React from 'react';
import { ProcessedData, FilterState } from '../types';
import Header from './Header';
import FilterControls from './FilterControls';
import SummaryCards from './SummaryCards';
import Charts from './Charts';

interface DashboardProps {
    data: ProcessedData;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onLogout: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    globalData: ProcessedData;
    isSupabaseAvailable?: boolean;
    isDataLoadedFromSupabase?: boolean;
    onSyncToSupabase?: () => void;
    isSyncing?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    data, 
    filters, 
    onFilterChange, 
    onLogout, 
    searchTerm, 
    onSearchChange, 
    globalData,
    isSupabaseAvailable = false,
    isDataLoadedFromSupabase = false,
    onSyncToSupabase,
    isSyncing = false
}) => {
    const handleReset = () => {
        onFilterChange({
            divisions: [], departments: [], categories: [], subcategories: [], classes: [],
            branches: [], brands: [], items: [], types: [], typePluses: [], saleType: 'ALL'
        });
        onSearchChange('');
    };

    return (
        <div className="flex flex-col gap-6">
            <Header onLogout={onLogout} />
            
            {isSupabaseAvailable && !isDataLoadedFromSupabase && onSyncToSupabase && (
                <div className="bg-slate-800/80 backdrop-blur-md border border-sky-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-sky-500/5 animate-pulse-slow">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-600/20 text-sky-400 rounded-xl flex items-center justify-center border border-sky-500/20 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white text-left">Supabase Database is Empty</h3>
                            <p className="text-sm text-slate-400 text-left">We detected active Supabase credentials but no records in the table. You can sync this uploaded configuration directly.</p>
                        </div>
                    </div>
                    <button
                        onClick={onSyncToSupabase}
                        disabled={isSyncing}
                        className="w-full md:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSyncing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.001 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                Syncing Database...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Sync Upload to Supabase PostgreSQL
                            </>
                        )}
                    </button>
                </div>
            )}
            <FilterControls
                options={data.filterOptions}
                filters={filters}
                onFilterChange={onFilterChange}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onReset={handleReset}
            />
            <SummaryCards 
                data={data} 
                saleType={filters.saleType || 'ALL'} 
                filteredBranchCount={data.branchCount2026}
                totalBranchCount={globalData.branchCount2026}
                percentTotal2026={globalData.totalSales2026 ? (data.totalSales2026 / globalData.totalSales2026) * 100 : 0}
                percentTotal2025={globalData.totalSales2025 ? (data.totalSales2025 / globalData.totalSales2025) * 100 : 0}
                percentCash2026={globalData.totalCashSales2026 ? (data.totalCashSales2026 / globalData.totalCashSales2026) * 100 : 0}
                percentCash2025={globalData.totalCashSales2025 ? (data.totalCashSales2025 / globalData.totalCashSales2025) * 100 : 0}
                percentCredit2026={globalData.totalCreditSales2026 ? (data.totalCreditSales2026 / globalData.totalCreditSales2026) * 100 : 0}
                percentCredit2025={globalData.totalCreditSales2025 ? (data.totalCreditSales2025 / globalData.totalCreditSales2025) * 100 : 0}
            />
            <Charts data={data} filters={filters} onFilterChange={onFilterChange} />

            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-rose-600 text-white font-bold rounded-lg shadow-md hover:bg-rose-700 transition-all flex items-center gap-2"
                    aria-label="Reset all filters"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
                    </svg>
                    Reset All Filters
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
