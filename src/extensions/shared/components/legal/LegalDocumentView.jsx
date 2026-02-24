import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Pencil, Save, X, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import LegalSection from "./LegalSection";
import LegalContentBlock from "./LegalContentBlock";

export default function LegalDocumentView({ document, onSave }) {
  const canEdit = typeof onSave === "function";
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  const data = isEditing ? editData : document;

  const startEditing = () => {
    if (!canEdit) return;
    setEditData(JSON.parse(JSON.stringify(document)));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const saveChanges = () => {
    if (!canEdit) return;
    onSave(editData);
    setIsEditing(false);
    setEditData(null);
  };

  const handleSectionChange = (sectionIdx, newSection) => {
    const newSections = [...(editData.sections || [])];
    newSections[sectionIdx] = newSection;
    setEditData({ ...editData, sections: newSections });
  };

  const addSection = () => {
    setEditData({
      ...editData,
      sections: [
        ...(editData.sections || []),
        { id: `section_${Date.now()}`, title: "סעיף חדש", numbering: "", content: [] },
      ],
    });
  };

  const removeSection = (sectionIdx) => {
    setEditData({
      ...editData,
      sections: (editData.sections || []).filter((_, i) => i !== sectionIdx),
    });
  };

  const moveSectionUp = (sectionIdx) => {
    if (sectionIdx === 0) return;
    const newSections = [...(editData.sections || [])];
    [newSections[sectionIdx - 1], newSections[sectionIdx]] = [newSections[sectionIdx], newSections[sectionIdx - 1]];
    setEditData({ ...editData, sections: newSections });
  };

  const moveSectionDown = (sectionIdx) => {
    if (sectionIdx === editData.sections.length - 1) return;
    const newSections = [...(editData.sections || [])];
    [newSections[sectionIdx], newSections[sectionIdx + 1]] = [newSections[sectionIdx + 1], newSections[sectionIdx]];
    setEditData({ ...editData, sections: newSections });
  };

  const handlePreambleChange = (blockIdx, newBlock) => {
    const newPreamble = [...(editData.preamble || [])];
    newPreamble[blockIdx] = newBlock;
    setEditData({ ...editData, preamble: newPreamble });
  };

  if (!data) return null;

  return (
    <div dir="rtl" className="documentContainer" style={!canEdit ? { paddingLeft: 0, paddingRight: 0 } : {}}>
      {canEdit && (
        <>
          {/* Edit/Save Controls */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-3 px-4 mb-6 -mx-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                {isEditing ? "מצב עריכה" : "מצב תצוגה"}
              </span>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      <X className="h-4 w-4 ml-1" />
                      ביטול
                    </Button>
                    <Button size="sm" onClick={saveChanges} className="bg-emerald-600 hover:bg-emerald-700">
                      <Save className="h-4 w-4 ml-1" />
                      שמור
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={startEditing} variant="outline">
                    <Pencil className="h-4 w-4 ml-1" />
                    עריכת תוכן
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Formatting Guide - Only visible in editing mode */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            📖 מדריך עיצוב וקישורים
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <span className="font-semibold">עיצוב טקסט:</span>
              <ul className="mr-4 mt-1 space-y-1">
                <li>• <code className="bg-blue-100 px-1.5 py-0.5 rounded">**טקסט**</code> - טקסט מודגש (בולד)</li>
                <li>• <code className="bg-blue-100 px-1.5 py-0.5 rounded">__טקסט__</code> - קו תחתון</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold">קישורים:</span>
              <ul className="mr-4 mt-1 space-y-1">
                <li>• <code className="bg-blue-100 px-1.5 py-0.5 rounded">[טקסט להצגה](https://example.com)</code> - קישור חיצוני</li>
                <li>• <code className="bg-blue-100 px-1.5 py-0.5 rounded">[לחץ כאן](#section-1)</code> - קישור לסעיף 1</li>
                <li>• <code className="bg-blue-100 px-1.5 py-0.5 rounded">[ראה סעיף 2.3](#subsection-2-3)</code> - קישור לתת-סעיף 2.3</li>
              </ul>
            </div>
            <div className="bg-blue-100 rounded p-2 mt-2">
              <span className="font-semibold">💡 איך ליצור קישור פנימי:</span>
              <ul className="mr-4 mt-1 space-y-1">
                <li>• לסעיף ראשי: השתמש ב-<code className="bg-white px-1.5 py-0.5 rounded">#section-X</code> (כאשר X הוא מספר הסעיף)</li>
                <li>• לתת-סעיף: השתמש ב-<code className="bg-white px-1.5 py-0.5 rounded">#subsection-X-Y</code> (כאשר X.Y הוא המספור המלא)</li>
                <li className="text-xs text-blue-600 mt-2">דוגמה: סעיף 3 → <code className="bg-white px-1 py-0.5 rounded">#section-3</code> | תת-סעיף 1.2 → <code className="bg-white px-1 py-0.5 rounded">#subsection-1-2</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <ol style={{ listStyle: 'none', counterReset: 'section', paddingRight: 0 }}>
        {(data.sections || []).map((section, sectionIdx) => (
          <li key={section.id || sectionIdx} className="relative group/section" style={{ counterIncrement: 'section' }}>
            {isEditing && (
              <div className="absolute -left-12 top-3 flex flex-col gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveSectionUp(sectionIdx)}
                  disabled={sectionIdx === 0}
                >
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveSectionDown(sectionIdx)}
                  disabled={sectionIdx === data.sections.length - 1}
                >
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeSection(sectionIdx)}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            )}
            <LegalSection
              section={section}
              isEditing={isEditing}
              onChange={(newSection) => handleSectionChange(sectionIdx, newSection)}
              sectionIndex={sectionIdx}
              sectionNumber={sectionIdx + 1}
            />
          </li>
        ))}
      </ol>

      {isEditing && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={addSection} className="gap-2">
            <Plus className="h-4 w-4" />
            הוסף סעיף חדש
          </Button>
        </div>
      )}

    </div>
  );
}