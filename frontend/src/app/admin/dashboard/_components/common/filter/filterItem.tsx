import React from "react";

interface StatusFilterState {
    checked: boolean;
    onChange: () => void;
    value: string;
    fontStyle: string
}

export function FilterItem({ checked, onChange, fontStyle, value } : StatusFilterState) {
    return (
        <label className="flex items-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={fontStyle}>{value}</span>
        </label>
    )
}