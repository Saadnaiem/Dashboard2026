

import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import { RawSalesDataRow, ProcessedData, FilterState } from './types';
import { processSalesData, normalizeRow } from './services/dataProcessor';
import LoadingIndicator from './components/LoadingIndicator';
import Dashboard from './components/Dashboard';
import DrilldownView from './components/DrilldownView';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

const createEmptyProcessedData = (filterOptions: ProcessedData['filterOptions']): ProcessedData => ({
    totalSales2025: 0, totalSales2026: 0, totalCashSales2025: 0, totalCashSales2026: 0, totalCreditSales2025: 0, totalCreditSales2026: 0, salesGrowthPercentage: 0,
    salesByDivision: [], salesByDepartment: [], salesByCategory: [], salesBySubcategory: [], salesByClass: [],
    salesByBrand: [], salesByBranch: [], salesByItem: [], salesByType: [], salesByTypePlus: [],
    top10Brands: [], top50Items: [], branchCount2025: 0, branchCount2026: 0, brandCount2025: 0, brandCount2026: 0, itemCount2025: 0,
    itemCount2026: 0, topDivision: null,
    pareto: {
        branches: { topCount: 0, salesPercent: 0, totalSales: 0, totalContributors: 0, topSales: 0 },
        brands: { topCount: 0, salesPercent: 0, totalSales: 0, totalContributors: 0, topSales: 0 },
        items: { topCount: 0, salesPercent: 0, totalSales: 0, totalContributors: 0, topSales: 0 },
    },
    paretoContributors: { branches: [], brands: [], items: [] },
    newEntities: {
        branches: { count: 0, sales: 0, percentOfTotal: 0 },
        brands: { count: 0, sales: 0, percentOfTotal: 0 },
        items: { count: 0, sales: 0, percentOfTotal: 0 },
    },
    newBrandsList: [], newItemsList: [],
    lostEntities: {
        brands: { count: 0, sales2025: 0, percentOfTotal: 0 },
        items: { count: 0, sales2025: 0, percentOfTotal: 0 },
    },
    lostBrandsList: [], lostItemsList: [], filterOptions: filterOptions,
});

const App: React.FC = () => {
    const [loadingState, setLoadingState] = useState({ isLoading: true, progress: 0, message: '' });
    const [error, setError] = useState<string | null>(null);
    const [allData, setAllData] = useState<RawSalesDataRow[]>([]);
    const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        divisions: [], departments: [], categories: [], subcategories: [], classes: [],
        branches: [], brands: [], items: [], types: [], typePluses: [], saleType: 'ALL'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const navigate = useNavigate();
    const location = useLocation();

    // Effect to sync auth state across tabs
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        // Automatically set loading state false when starting up since we wait for direct CSV upload from user
        setLoadingState({ isLoading: false, progress: 0, message: '' });
    }, []);

    useEffect(() => {
        if (allData.length > 0) {
            try {
                const data = processSalesData(allData);
                setProcessedData(data);
                setLoadingState({ isLoading: true, progress: 100, message: 'Done!' });
                setTimeout(() => setLoadingState({ isLoading: false, progress: 0, message: '' }), 500);
            } catch (err: any) {
                setError(err instanceof Error ? `Error processing data: ${err.message}` : 'An unknown error occurred during data processing.');
                setLoadingState({ isLoading: false, progress: 0, message: '' });
            }
        }
    }, [allData]);

    // Generic Debounce Hook
    function useDebounce<T>(value: T, delay: number): T {
        const [debouncedValue, setDebouncedValue] = useState<T>(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    }

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Optimized Filtering: Returns the raw rows matching the filters
    const filteredRows = useMemo(() => {
        if (!allData || allData.length === 0) return [];

        const lowercasedTerm = debouncedSearchTerm.toLowerCase();

        return allData.filter(row => {
            // Dropdown filters
            const { divisions, departments, categories, branches, brands, types, typePluses } = filters;

            // Fast fail checks
            if (divisions.length > 0 && !divisions.includes(row['DIVISION'])) return false;
            // Add check: only filter by Department if selected
            if (departments.length > 0 && (!row['DEPARTMENT'] || !departments.includes(row['DEPARTMENT']))) return false;
            if (categories.length > 0 && (!row['CATEGORY'] || !categories.includes(row['CATEGORY']))) return false;
            if (branches.length > 0 && !branches.includes(row['BRANCH NAME'])) return false;
            if (brands.length > 0 && !brands.includes(row['BRAND'])) return false;
            if (types.length > 0 && (!row['TYPE'] || !types.includes(row['TYPE']))) return false;
            if (typePluses.length > 0 && (!row['TYPE Plus'] || !typePluses.includes(row['TYPE Plus']))) return false;

            // Search term filter using optimized index
            if (lowercasedTerm) {
                // If _searchIndex exists, use it. Otherwise fall back to slower individual field checks (safety)
                if (row._searchIndex) {
                    return row._searchIndex.includes(lowercasedTerm);
                }
                return (
                    (row['DIVISION']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['DEPARTMENT']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['CATEGORY']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['BRANCH NAME']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['BRANCH CODE']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['BRAND']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['ITEM DESCRIPTION']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['ITEM CODE']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['CLASS']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['SUBCATEGORY']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['TYPE']?.toLowerCase().includes(lowercasedTerm)) ||
                    (row['TYPE Plus']?.toLowerCase().includes(lowercasedTerm))
                );
            }

            return true;
        });
    }, [allData, filters, debouncedSearchTerm]);

    // Process the ALREADY FILTERED rows to get the stats (Summary Cards, Charts, etc.)
    const processedFilteredData = useMemo(() => {
        if (filteredRows.length > 0) {
            return processSalesData(filteredRows, processedData?.filterOptions, filters.saleType);
        }
        // If no rows match the filters, return an empty processed data structure
        return createEmptyProcessedData(processedData?.filterOptions || {
            divisions: [], departments: [], categories: [], subcategories: [], classes: [],
            branches: [], brands: [], items: [], types: [], typePluses: []
        });
    }, [filteredRows, processedData?.filterOptions, filters.saleType]);

    const handleLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoadingState({ isLoading: true, progress: 25, message: 'Parsing uploaded file...' });
        setError(null);

        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            worker: true,
            complete: (results) => {
                setLoadingState({ isLoading: true, progress: 50, message: 'Validating data...' });
                const requiredHeaders = ['DIVISION', 'BRANCH NAME', 'BRAND', 'ITEM DESCRIPTION'];
                const fileHeaders = results.meta.fields?.map(h => h.trim().toUpperCase()) || [];
                const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

                if (missingHeaders.length > 0) {
                    setError(`Missing required columns: ${missingHeaders.join(', ')}`);
                    setLoadingState({ isLoading: false, progress: 0, message: '' });
                    return;
                }

                setAllData(results.data.map(row => normalizeRow(row, fileHeaders)));
                setLoadingState({ isLoading: true, progress: 75, message: 'Processing data...' });
            },
            error: (err: any) => {
                setError(`Failed to parse CSV data: ${err.message}`);
                setLoadingState({ isLoading: false, progress: 0, message: '' });
            }
        });
    };

    const renderContent = () => {
        if (!allData || allData.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
                    <div className="w-full max-w-md p-8 bg-slate-800/50 rounded-2xl shadow-2xl border border-slate-700">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-extrabold text-white">Pharmacy Analytics</h1>
                            </div>
                            <h2 className="text-xl font-bold text-sky-400">Upload Sales CSV Data</h2>
                            <p className="text-sm text-slate-400 mt-2">Select your sales CSV record file to launch the dashboard insights.</p>
                        </div>

                        {error && (
                            <div className="w-full bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-6 text-center" role="alert">
                                <strong className="font-bold block mb-1">Upload Error</strong>
                                <span className="block">{error}</span>
                            </div>
                        )}

                        <label className="block w-full cursor-pointer">
                            <span className="sr-only">Choose CSV file</span>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center justify-center px-4 py-8 bg-slate-700/50 text-sky-400 rounded-lg border-2 border-dashed border-slate-600 hover:bg-slate-700 hover:border-sky-500 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-10 mb-3 text-sky-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="font-bold text-lg text-white group-hover:text-sky-400 transition-colors">Select CSV File</span>
                                <span className="text-xs text-slate-400 mt-2 text-center break-words px-4">Required columns: DIVISION, BRANCH NAME, BRAND, ITEM DESCRIPTION</span>
                            </div>
                        </label>
                    </div>
                </div>
            );
        }
        if (loadingState.isLoading || (!processedFilteredData && isAuthenticated)) {
            return <div className="min-h-screen flex items-center justify-center"><LoadingIndicator progress={loadingState.progress} message={loadingState.message} /></div>;
        }

        return (
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        path="/"
                        element={
                                <Dashboard
                                    data={processedFilteredData!}
                                    filters={filters}
                                    onFilterChange={setFilters}
                                    onLogout={handleLogout}
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    globalData={processedData!}
                                />
                        }
                    />
                    <Route
                        path="/details/:viewType"
                        element={<DrilldownView allRawData={filteredRows} globalFilterOptions={processedFilteredData?.filterOptions} globalData={processedData!} />}
                    />
                </Route>
            </Routes>
        );
    };

    return <div className="min-h-screen">{renderContent()}</div>;
};

export default App;