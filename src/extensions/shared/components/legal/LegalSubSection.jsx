import React, { useState, useEffect } from "react";
// using plain div for collapse so CSS .open controls max-height
import LegalContentBlock from "./LegalContentBlock";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import LegalNumberedSubSections from "./LegalNumberedSubSections";

const parseTitle = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
};

const stripFormatting = (text) => {
  if (!text) return "";
  const noHtml = text.replace(/<[^>]+>/g, "");
  return noHtml.replace(/\*\*|__|\*|`|_/g, "").replace(/\s+/g, " ").trim();
};

export default function LegalSubSection({ subSection, isEditing, onChange, depth = 0, numbering = "", parentNumbering = undefined, rootId }) {
  const [isOpen, setIsOpen] = useState(false);
  const subSectionId = rootId ? rootId : numbering ? `subsection-${numbering.replace(/\./g, '-')}` : `subsection-${Date.now()}`;

  useEffect(() => {
    const handleInternalLink = (e) => {
      const target = e.target;
      if (target.tagName === 'A' && target.dataset.internalLink) {
        const anchorId = target.dataset.internalLink;
        
        if (anchorId === subSectionId) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    const handleOpenSubSection = (e) => {
      const anchorId = e.detail.anchorId;
      
      // Check if this subsection or any nested subsection matches
      if (anchorId === subSectionId || anchorId.startsWith(subSectionId + '-')) {
        setIsOpen(true);
      }
    };

    document.addEventListener('click', handleInternalLink);
    document.addEventListener('openSubSection', handleOpenSubSection);
    return () => {
      document.removeEventListener('click', handleInternalLink);
      document.removeEventListener('openSubSection', handleOpenSubSection);
    };
  }, [subSectionId]);

  const handleContentChange = (blockIdx, newBlock) => {
    const newContent = [...(subSection.content || [])];
    newContent[blockIdx] = newBlock;
    onChange({ ...subSection, content: newContent });
  };

  const addContentBlock = (type) => {
    const newBlock =
      type === "paragraph"
        ? { type: "paragraph", text: "" }
        : type === "heading"
        ? { type: "heading", text: "" }
        : type === "bullets"
        ? { type: "bullets", items: [""] }
        : type === "numbered_list"
        ? { type: "numbered_list", items: [""] }
        : type === "table"
        ? { type: "table", data: { headers: ["עמודה 1", "עמודה 2"], rows: [["", ""]] } }
        : type === "subsection"
        ? { type: "subsection", title: "תת-סעיף חדש", content: [] }
        : type === "numbered_subsections"
        ? { type: "numbered_subsections", items: [{ title: "תת-סעיף 1", content: [] }] }
        : null;
    if (newBlock) {
      onChange({ ...subSection, content: [...(subSection.content || []), newBlock] });
    }
  };

  const removeContentBlock = (blockIdx) => {
    onChange({
      ...subSection,
      content: (subSection.content || []).filter((_, i) => i !== blockIdx),
    });
  };

  const moveContentUp = (blockIdx) => {
    if (blockIdx === 0) return;
    const newContent = [...(subSection.content || [])];
    [newContent[blockIdx - 1], newContent[blockIdx]] = [newContent[blockIdx], newContent[blockIdx - 1]];
    onChange({ ...subSection, content: newContent });
  };

  const moveContentDown = (blockIdx) => {
    const content = subSection.content || [];
    if (blockIdx === content.length - 1) return;
    const newContent = [...content];
    [newContent[blockIdx], newContent[blockIdx + 1]] = [newContent[blockIdx + 1], newContent[blockIdx]];
    onChange({ ...subSection, content: newContent });
  };

  const handleSubSectionChange = (blockIdx, newSubSection) => {
    const newContent = [...(subSection.content || [])];
    newContent[blockIdx] = { type: "subsection", ...newSubSection };
    onChange({ ...subSection, content: newContent });
  };

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          const el = document.getElementById(`${subSectionId}-content`);
          if (el) el.focus();
        }, 220);
      }
      return next;
    });
  };

  return (
    <div className={depth > 0 ? "subSectionWrapperIndented" : "subSectionWrapper"} id={subSectionId}>
      <button
        onClick={toggleOpen}
        className="subSectionButton"
        aria-expanded={isOpen}
        aria-controls={`${subSectionId}-content`}
        aria-describedby={`${subSectionId}-title`}
      >
        <div className={isOpen ? "subSectionCircle subSectionCircleOpen" : "subSectionCircle"}>
          {isOpen ? (
            <ChevronUp className="subSectionCircleIcon" />
          ) : (
            <ChevronDown className="subSectionCircleIcon" />
          )}
        </div>

        {isEditing ? (
          <Input
            value={subSection.title || ""}
            onChange={(e) => {
              e.stopPropagation();
              onChange({ ...subSection, title: e.target.value });
            }}
            id={`${subSectionId}-title`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold flex-1"
          />
        ) : (
          (() => {
            const Heading = ({ depth, html, style, id }) => {
              const level = Math.min(6, 3 + depth);
              const tag = `h${level}`;
              return React.createElement(tag, { id, style: { margin: 0, ...style }, dangerouslySetInnerHTML: { __html: html } });
            };
            return (
              <Heading id={`${subSectionId}-title`} depth={depth} html={parseTitle(subSection.title)} style={{ fontWeight: 600 }} />
            );
          })()
        )}
      </button>

      <div
        id={`${subSectionId}-content`}
        className={isOpen ? "subSectionContentWrapper open" : "subSectionContentWrapper"}
        role="region"
        aria-hidden={!isOpen}
        tabIndex={-1}
      >
        <div className="subSectionContent" style={{ opacity: isOpen ? 1 : 0, transition: 'opacity .18s ease' }}>
              {(subSection.content || []).map((block, blockIdx) => (
                <div key={blockIdx} className="relative group/block">
                  {isEditing && (
                    <div className="absolute -right-7 top-0 flex gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => moveContentUp(blockIdx)}
                        disabled={blockIdx === 0}
                      >
                        <ArrowUp className="h-3 w-3 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => moveContentDown(blockIdx)}
                        disabled={blockIdx === (subSection.content || []).length - 1}
                      >
                        <ArrowDown className="h-3 w-3 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeContentBlock(blockIdx)}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                  )}
                  {block.type === "subsection" ? (
                    <LegalSubSection
                      subSection={block}
                      isEditing={isEditing}
                      onChange={(newSub) => handleSubSectionChange(blockIdx, newSub)}
                      depth={depth + 1}
                      numbering={`${numbering}.${blockIdx + 1}`}
                      parentNumbering={numbering}
                    />
                  ) : block.type === "numbered_subsections" ? (
                    <LegalNumberedSubSections
                      block={block}
                      isEditing={isEditing}
                      onChange={(newBlock) => handleContentChange(blockIdx, newBlock)}
                      parentNumbering={parentNumbering !== undefined ? parentNumbering : numbering}
                    />
                  ) : (
                    <LegalContentBlock
                      block={block}
                      isEditing={isEditing}
                      onChange={(newBlock) => handleContentChange(blockIdx, newBlock)}
                      parentNumbering={numbering}
                    />
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="flex items-center gap-2 pt-3 border-t border-dashed border-gray-200 mt-3">
                  <span className="text-xs text-gray-400">הוסף:</span>
                  <AddBlockButtons onAdd={addContentBlock} />
                </div>
              )}
            </div>
          </div>
    </div>
  );
}

function AddBlockButtons({ onAdd }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[
        { type: "paragraph", label: "פסקה" },
        { type: "heading", label: "כותרת" },
        { type: "bullets", label: "רשימה" },
        { type: "numbered_list", label: "רשימה ממוספרת" },
        { type: "table", label: "טבלה" },
        { type: "subsection", label: "תת-סעיף" },
        { type: "numbered_subsections", label: "רשימת תת-סעיפים" },
      ].map((item) => (
        <Button
          key={item.type}
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2"
          onClick={() => onAdd(item.type)}
        >
          <Plus className="h-3 w-3 ml-1" />
          {item.label}
        </Button>
      ))}
    </div>
  );
}