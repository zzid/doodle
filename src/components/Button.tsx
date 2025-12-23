import React from "react";

export const Button = ({ children }: { children: React.ReactNode }) => {
    return (
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            {children}
        </button>
    );
};
