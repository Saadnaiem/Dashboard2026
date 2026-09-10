export interface RawSalesDataRow {
    [key: string]: any;
    'DIVISION': string;
    'DEPARTMENT'?: string;
    'CATEGORY'?: string;
    'SUBCATEGORY'?: string;
    'CLASS'?: string;
    'BRAND': string;
    'BRANCH CODE'?: string;
    'BRANCH NAME': string;
    'ITEM CODE'?: string;
    'ITEM DESCRIPTION': string;
    'TYPE'?: string;
    'TYPE Plus'?: string;

    // 2025 Metrics
    '2025 CASH SALES': number;
    '2025 CREDIT SALES': number;
    '2025 TOTAL SALES': number;

    // 2026 Metrics
    '2026 CASH SALES': number;
    '2026 CREDIT SALES': number;
    '2026 TOTAL SALES': number;

    // Legacy support (optional, can be mapped from above)
    'SALES2025'?: number;
    'SALES2026'?: number;

    // Search Optimization
    _searchIndex?: string;
}

export interface ParetoResult {
    topCount: number;
    salesPercent: number;
    totalSales: number;
    totalContributors: number;
    topSales: number;
}

export interface EntitySalesData {
    name: string;
    sales2025: number; // Total Sales 2025
    sales2026: number; // Total Sales 2026

    cashSales2025: number;
    creditSales2025: number;

    cashSales2026: number;
    creditSales2026: number;

    growth: number;
    code?: string;
}

export interface ProcessedData {
    totalSales2025: number;
    totalSales2026: number;
    totalCashSales2025: number;
    totalCashSales2026: number;
    totalCreditSales2025: number;
    totalCreditSales2026: number;
    salesGrowthPercentage: number;

    salesByDivision: EntitySalesData[];
    salesByDepartment: EntitySalesData[];
    salesByCategory: EntitySalesData[];
    salesBySubcategory: EntitySalesData[];
    salesByClass: EntitySalesData[];
    salesByBrand: EntitySalesData[];
    salesByBranch: EntitySalesData[];
    salesByItem: EntitySalesData[];
    salesByType: EntitySalesData[];
    salesByTypePlus: EntitySalesData[];

    top10Brands: { name: string; sales2025: number; sales2026: number }[];
    top50Items: { name: string; sales2025: number; sales2026: number }[];

    branchCount2025: number;
    branchCount2026: number;
    brandCount2025: number;
    brandCount2026: number;
    itemCount2025: number;
    itemCount2026: number;

    topDivision: { name: string; sales2025: number; sales2026: number; growth: number; } | null;

    pareto: {
        branches: ParetoResult;
        brands: ParetoResult;
        items: ParetoResult;
    };

    paretoContributors: {
        branches: EntitySalesData[];
        brands: EntitySalesData[];
        items: EntitySalesData[];
    };

    newEntities: {
        branches: { count: number; sales: number; percentOfTotal: number };
        brands: { count: number; sales: number; percentOfTotal: number };
        items: { count: number; sales: number; percentOfTotal: number };
    };

    newBrandsList: { name: string; sales2026: number }[];
    newItemsList: { name: string; sales2026: number; code: string }[];

    lostEntities: {
        brands: { count: number; sales2025: number; percentOfTotal: number };
        items: { count: number; sales2025: number; percentOfTotal: number };
    };

    lostBrandsList: { name: string; sales2025: number }[];
    lostItemsList: { name: string; sales2025: number; code: string }[];

    filterOptions: {
        divisions: string[];
        departments: string[];
        categories: string[];
        subcategories: string[];
        classes: string[];
        branches: string[];
        brands: string[];
        items: string[];
        types: string[];
        typePluses: string[];
    };
}

export interface FilterState {
    divisions: string[];
    departments: string[];
    categories: string[];
    subcategories: string[];
    classes: string[];
    branches: string[];
    brands: string[];
    items: string[];
    types: string[];
    typePluses: string[];
    saleType: 'ALL' | 'CASH' | 'CREDIT';
}