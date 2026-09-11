
import React from 'react';

interface LoadingIndicatorProps {
    progress: number;
    message: string;
    details?: {
        loadedRows: number;
        totalRows: number | null;
        elapsedSeconds?: number;
        estimatedRemainingSeconds?: number | null;
    } | null;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ progress, message, details = null }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-6 bg-slate-900/40 rounded-3xl max-w-lg mx-auto border border-slate-800 backdrop-blur-md shadow-2xl">
            <div className="relative w-20 h-20 mb-2">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-emerald-500 border-l-emerald-500 border-b-emerald-500/20 animate-spin rounded-full"></div>
            </div>
            
            <h3 className="text-xl font-bold text-white tracking-wider mt-4">Pharmacy Analytics</h3>
            <p className="text-emerald-400 text-sm mt-1 max-w-sm font-bold tracking-wide animate-pulse">Connecting data from server...</p>

            <div className="w-full bg-slate-800 rounded-full h-5 mt-8 overflow-hidden shadow-inner border border-slate-700">
                <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full text-center text-xs font-black text-white flex items-center justify-center transition-all duration-350 shadow-inner"
                    style={{ width: `${progress}%` }}
                >
                    {progress > 5 && `${progress}%`}
                </div>
            </div>

            <p className="text-slate-400 text-xs mt-5 font-semibold uppercase tracking-widest">{message}</p>
            
            {details && (
                <div className="mt-8 bg-slate-800/40 border border-slate-750 p-5 rounded-2xl w-full text-left text-sm text-slate-350 space-y-3 shadow-md">
                    {details.elapsedSeconds !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-semibold">Time Elapsed:</span>
                            <span className="font-extrabold text-emerald-400">{details.elapsedSeconds}s</span>
                        </div>
                    )}

                    {details.estimatedRemainingSeconds !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-semibold">Estimated Remaining:</span>
                            <span className="font-extrabold text-teal-400 text-base animate-pulse">
                                {details.estimatedRemainingSeconds === null 
                                    ? 'Calculating...' 
                                    : `${details.estimatedRemainingSeconds}s`}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoadingIndicator;
