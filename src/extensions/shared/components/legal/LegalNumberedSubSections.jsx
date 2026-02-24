import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LegalContentBlock from "./LegalContentBlock";
import LegalSubSection from "./LegalSubSection";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";

const parseTitle = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
};

function NumberedSubSectionItem({ item, isEditing, onChange, numbering }) {
  const [isOpen, setIsOpen] = useState(false);
  const itemId = `subsection-${numbering.replace(/\./g, '-')}`;

  React.useEffect(() => {
    const handleInternalLink = (e) => {
      const target = e.target;
      if (target.tagName === 'A' && target.dataset.internalLink) {
        const anchorId = target.dataset.internalLink;
        
        if (anchorId === itemId) {
          e.preventDefault();
          setIsOpen(true);
          setTimeout(() => {
            const element = document.getElementById(anchorId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      }
    };

    document.addEventListener('click', handleInternalLink);
    return () => document.removeEventListener('click', handleInternalLink);
  }, [itemId]);

  const handleContentChange = (blockIdx, newBlock) => {
    const newContent = [...(item.content || [])];
    newContent[blockIdx] = newBlock;
    onChange({ ...item, content: newContent });
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
        : null;
    if (newBlock) {
      onChange({ ...item, content: [...(item.content || []), newBlock] });
    }
  };

  const removeContentBlock = (blockIdx) => {
    onChange({
      ...item,
      content: (item.content || []).filter((_, i) => i !== blockIdx),
    });
  };

  const moveContentUp = (blockIdx) => {
    if (blockIdx === 0) return;
    const newContent = [...(item.content || [])];
    [newContent[blockIdx - 1], newContent[blockIdx]] = [newContent[blockIdx], newContent[blockIdx - 1]];
    onChange({ ...item, content: newContent });
  };

  const moveContentDown = (blockIdx) => {
    const content = item.content || [];
    if (blockIdx === content.length - 1) return;
    const newContent = [...content];
    [newContent[blockIdx], newContent[blockIdx + 1]] = [newContent[blockIdx + 1], newContent[blockIdx]];
    onChange({ ...item, content: newContent });
  };

  const handleSubSectionChange = (blockIdx, newSubSection) => {
    const newContent = [...(item.content || [])];
    newContent[blockIdx] = { type: "subsection", ...newSubSection };
    onChange({ ...item, content: newContent });
  };

  return (
    <div className="numberedItemWrapper" id={itemId}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="subSectionButton"
      >
        <div className="numberedItemToggleGroup">
          <div className={isOpen ? "subSectionCircle subSectionCircleOpen" : "subSectionCircle"}>
            {isOpen ? (
              <ChevronUp className="subSectionCircleIcon" />
            ) : (
              <ChevronDown className="subSectionCircleIcon" />
            )}
          </div>
          <span className="subSectionNumbering" style={/\*\*/.test(item.title) ? { fontWeight: 700 } : {}}>{numbering}.</span>
        </div>
        {isEditing ? (
          <Input
            value={item.title}
            onChange={(e) => {
              e.stopPropagation();
              onChange({ ...item, title: e.target.value });
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium flex-1"
          />
        ) : (
          <span className="subSectionTitle" dangerouslySetInnerHTML={{ __html: parseTitle(item.title) }} />
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
              {(item.content || []).map((block, blockIdx) => (
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
                        disabled={blockIdx === (item.content || []).length - 1}
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
                      depth={0}
                      numbering={numbering}
                      parentNumbering={numbering}
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
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { type: "paragraph", label: "פסקה" },
                      { type: "heading", label: "כותרת" },
                      { type: "bullets", label: "רשימה" },
                      { type: "numbered_list", label: "רשימה ממוספרת" },
                      { type: "table", label: "טבלה" },
                      { type: "subsection", label: "תת-סעיף" },
                    ].map((item) => (
                      <Button
                        key={item.type}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => addContentBlock(item.type)}
                      >
                        <Plus className="h-3 w-3 ml-1" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LegalNumberedSubSections({ block, isEditing, onChange, parentNumbering }) {
  const handleItemChange = (idx, newItem) => {
    const newItems = block.items.map((item, i) => (i === idx ? newItem : item));
    onChange({ ...block, items: newItems });
  };

  const addItem = () => {
    onChange({
      ...block,
      items: [...block.items, { title: `תת-סעיף ${block.items.length + 1}`, content: [] }],
    });
  };

  const removeItem = (idx) => {
    onChange({
      ...block,
      items: block.items.filter((_, i) => i !== idx),
    });
  };

  const moveItemUp = (idx) => {
    if (idx === 0) return;
    const newItems = [...block.items];
    [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    onChange({ ...block, items: newItems });
  };

  const moveItemDown = (idx) => {
    if (idx === block.items.length - 1) return;
    const newItems = [...block.items];
    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    onChange({ ...block, items: newItems });
  };

  return (
    <div className="contentBlockWrapper">
      {block.items.map((item, idx) => {
        const numbering = parentNumbering ? `${parentNumbering}.${idx + 1}` : `${idx + 1}`;
        return (
          <div key={idx} className="relative group/item">
            {isEditing && (
              <div className="absolute -left-12 top-3 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveItemUp(idx)}
                  disabled={idx === 0}
                >
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveItemDown(idx)}
                  disabled={idx === block.items.length - 1}
                >
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            )}
            <NumberedSubSectionItem
              item={item}
              isEditing={isEditing}
              onChange={(newItem) => handleItemChange(idx, newItem)}
              numbering={numbering}
            />
          </div>
        );
      })}
      {isEditing && (
        <Button variant="ghost" size="sm" onClick={addItem} className="mt-2 text-xs text-blue-600">
          <Plus className="h-3 w-3 ml-1" />
          הוסף תת-סעיף
        </Button>
      )}
    </div>
  );
}