import React from "react";

export const Tag = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            {children}
        </div>
    );
};
