
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
}

const Dashboard: React.FC<DashboardProps> = ({ data, filters, onFilterChange, onLogout, searchTerm, onSearchChange, globalData }) => {
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
