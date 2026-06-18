// src/components/DataTable.js
import React from 'react';

/**
 * A reusable table component for administrative views.
 * Supports custom columns, editing, and conditional deletion.
 * * @param {Array} data - The dataset to display.
 * @param {Array} columns - Configuration for table columns.
 * @param {Function} onDelete - Handler for delete actions.
 * @param {Function} onEdit - Handler for edit actions.
 * @param {Function} canDelete - Optional logic to determine if the delete button should be shown.
 */
const DataTable = ({ data, columns, onDelete, onEdit, canDelete }) => {
    
    // Helper to extract unique row identifiers
    const getRowId = (row) => row.id || row.userId || row._id;

    return (
        <table className="admin-data-table">
            <thead>
                <tr>
                    {columns.map((col, index) => (
                        <th key={index}>{col.header}</th>
                    ))}
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row) => {
                    const showDelete = canDelete ? canDelete(row) : true;
                    const rowId = getRowId(row);
                    
                    return (
                        <tr key={rowId}>
                            {columns.map((col, index) => {
                                const key = col.field || col.accessor;
                                return (
                                    <td key={index}>
                                        {col.render ? col.render(row) : row[key]}
                                    </td>
                                );
                            })}
                            
                            <td className="admin-actions-cell">
                                <button
                                    type="button"
                                    className="admin-action-btn admin-action-edit"
                                    onClick={() => onEdit && onEdit(row)}
                                >
                                    Edit
                                </button>
                                
                                {showDelete && (
                                    <button
                                        type="button"
                                        className="admin-action-btn admin-action-delete"
                                        onClick={() => onDelete(rowId, row)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default DataTable;