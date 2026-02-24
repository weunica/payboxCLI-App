import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowRight, ArrowDown as ArrowDownMerge, X } from "lucide-react";


const parseTextWithLinks = (text) => {
  if (!text) return "";
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
  
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    if (url.startsWith('#')) {
      const anchorId = url.substring(1);
      return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" data-internal-link="${anchorId}">${linkText}</a>`;
    } else {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${linkText}</a>`;
    }
  });
  
  return html;
};

export default function LegalTable({ data, isEditing, onChange }) {
  const headers = data.headers || [];
  const rows = data.rows || [];
  const mergedCells = data.mergedCells || {};
  const headerMergedCells = data.headerMergedCells || {};

  const isHeaderHidden = (colIdx) => {
    for (let c = 0; c < colIdx; c++) {
      const merge = headerMergedCells[`h-${c}`];
      if (merge && c + merge.colspan - 1 >= colIdx) return true;
    }
    return false;
  };

  const mergeHeaderRight = (colIdx) => {
    const key = `h-${colIdx}`;
    const current = headerMergedCells[key] || { colspan: 1 };
    onChange({ ...data, headerMergedCells: { ...headerMergedCells, [key]: { colspan: current.colspan + 1 } } });
  };

  const resetHeaderMerge = (colIdx) => {
    const newHMC = { ...headerMergedCells };
    delete newHMC[`h-${colIdx}`];
    onChange({ ...data, headerMergedCells: newHMC });
  };

  const handleHeaderChange = (colIdx, value) => {
    const newHeaders = [...headers];
    newHeaders[colIdx] = value;
    onChange({ ...data, headers: newHeaders });
  };

  const handleCellChange = (rowIdx, colIdx, value) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : [...row]
    );
    onChange({ ...data, rows: newRows });
  };

  const addRow = () => {
    onChange({ ...data, rows: [...rows, headers.map(() => "")] });
  };

  const removeRow = (rowIdx) => {
    onChange({ ...data, rows: rows.filter((_, i) => i !== rowIdx) });
  };

  const moveRowUp = (rowIdx) => {
    if (rowIdx === 0) return;
    const newRows = [...rows];
    [newRows[rowIdx - 1], newRows[rowIdx]] = [newRows[rowIdx], newRows[rowIdx - 1]];
    onChange({ ...data, rows: newRows });
  };

  const moveRowDown = (rowIdx) => {
    if (rowIdx === rows.length - 1) return;
    const newRows = [...rows];
    [newRows[rowIdx], newRows[rowIdx + 1]] = [newRows[rowIdx + 1], newRows[rowIdx]];
    onChange({ ...data, rows: newRows });
  };

  const addColumn = () => {
    onChange({
      ...data,
      headers: [...headers, "עמודה חדשה"],
      rows: rows.map((row) => [...row, ""]),
    });
  };

  const removeColumn = (colIdx) => {
    onChange({
      ...data,
      headers: headers.filter((_, i) => i !== colIdx),
      rows: rows.map((row) => row.filter((_, i) => i !== colIdx)),
    });
  };

  const mergeCellRight = (rowIdx, colIdx) => {
    const key = `${rowIdx}-${colIdx}`;
    const currentMerge = mergedCells[key] || { colspan: 1, rowspan: 1 };
    const newMergedCells = {
      ...mergedCells,
      [key]: { ...currentMerge, colspan: currentMerge.colspan + 1 }
    };
    onChange({ ...data, mergedCells: newMergedCells });
  };

  const mergeCellDown = (rowIdx, colIdx) => {
    const key = `${rowIdx}-${colIdx}`;
    const currentMerge = mergedCells[key] || { colspan: 1, rowspan: 1 };
    const newMergedCells = {
      ...mergedCells,
      [key]: { ...currentMerge, rowspan: currentMerge.rowspan + 1 }
    };
    onChange({ ...data, mergedCells: newMergedCells });
  };

  const resetCellMerge = (rowIdx, colIdx) => {
    const key = `${rowIdx}-${colIdx}`;
    const newMergedCells = { ...mergedCells };
    delete newMergedCells[key];
    onChange({ ...data, mergedCells: newMergedCells });
  };

  const isCellHidden = (rowIdx, colIdx) => {
    for (let r = 0; r <= rowIdx; r++) {
      for (let c = 0; c <= colIdx; c++) {
        const key = `${r}-${c}`;
        const merge = mergedCells[key];
        if (merge) {
          const endsAtRow = r + merge.rowspan - 1;
          const endsAtCol = c + merge.colspan - 1;
          if (rowIdx <= endsAtRow && colIdx <= endsAtCol && !(r === rowIdx && c === colIdx)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  return (
    <div className="tableWrapper" dir="rtl" style={{ direction: 'rtl' }}>
      <table className="table" dir="rtl" style={{ direction: 'rtl' }}>
        <thead>
          <tr className="tableHeaderRow">
            {headers.map((header, i) => {
              if (isHeaderHidden(i)) return null;
              const hKey = `h-${i}`;
              const hMerge = headerMergedCells[hKey] || { colspan: 1 };
              return (
                <th key={i} className="tableHeader" colSpan={hMerge.colspan}>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={header}
                        onChange={(e) => handleHeaderChange(i, e.target.value)}
                        className="text-sm h-8"
                      />
                      {i + hMerge.colspan < headers.length && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => mergeHeaderRight(i)}
                          title="איחוד עם עמודה מימין"
                        >
                          <ArrowRight className="h-3 w-3 text-blue-400" />
                        </Button>
                      )}
                      {hMerge.colspan > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => resetHeaderMerge(i)}
                          title="בטל איחוד"
                        >
                          <X className="h-3 w-3 text-orange-400" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeColumn(i)}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: parseTextWithLinks(header) }} />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="tableRow">
              {row.map((cell, colIdx) => {
                if (isCellHidden(rowIdx, colIdx)) return null;
                
                const key = `${rowIdx}-${colIdx}`;
                const merge = mergedCells[key] || { colspan: 1, rowspan: 1 };
                
                return (
                  <td 
                    key={colIdx} 
                    className="tableCell group"
                    style={{ position: 'relative' }}
                    colSpan={merge.colspan}
                    rowSpan={merge.rowspan}
                  >
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          value={cell}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          className="text-sm h-8"
                        />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {colIdx + merge.colspan < headers.length && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => mergeCellRight(rowIdx, colIdx)}
                              title="איחוד עם עמודה מימין"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                          {rowIdx + merge.rowspan < rows.length && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => mergeCellDown(rowIdx, colIdx)}
                              title="איחוד עם שורה למטה"
                            >
                              <ArrowDownMerge className="h-3 w-3" />
                            </Button>
                          )}
                          {(merge.colspan > 1 || merge.rowspan > 1) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => resetCellMerge(rowIdx, colIdx)}
                            >
                              בטל איחוד
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span 
                        dangerouslySetInnerHTML={{ __html: parseTextWithLinks(cell) }}
                      />
                    )}
                  </td>
                );
              })}
              {isEditing && (
                <td className="border border-gray-300 px-2 py-1">
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveRowUp(rowIdx)}
                      disabled={rowIdx === 0}
                    >
                      <ArrowUp className="h-3 w-3 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveRowDown(rowIdx)}
                      disabled={rowIdx === rows.length - 1}
                    >
                      <ArrowDown className="h-3 w-3 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeRow(rowIdx)}
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isEditing && (
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-3 w-3 ml-1" />
            שורה
          </Button>
          <Button variant="outline" size="sm" onClick={addColumn}>
            <Plus className="h-3 w-3 ml-1" />
            עמודה
          </Button>
        </div>
      )}
    </div>
  );
}