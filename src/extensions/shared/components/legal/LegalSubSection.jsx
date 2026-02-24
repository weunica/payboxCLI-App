import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const parseTitle = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
};
import LegalContentBlock from "./LegalContentBlock";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import LegalNumberedSubSections from "./LegalNumberedSubSections";

export default function LegalSubSection({ subSection, isEditing, onChange, depth = 0, numbering = "", parentNumbering = undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const subSectionId = numbering ? `subsection-${numbering.replace(/\./g, '-')}` : `subsection-${Date.now()}`;

  React.useEffect(() => {
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

  return (
    <div className={depth > 0 ? "subSectionWrapperIndented" : "subSectionWrapper"} id={subSectionId}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="subSectionButton"
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
            value={subSection.title}
            onChange={(e) => {
              e.stopPropagation();
              onChange({ ...subSection, title: e.target.value });
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium flex-1"
          />
        ) : (
          <span className="subSectionTitle" dangerouslySetInnerHTML={{ __html: parseTitle(subSection.title) }} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="subSectionContentWrapper"
          >
            <div className="subSectionContent">
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
          </motion.div>
        )}
      </AnimatePresence>
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