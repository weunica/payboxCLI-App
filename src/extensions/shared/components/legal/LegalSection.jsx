import React, { useState } from "react";
import { Trash2, Plus, ArrowUp, ArrowDown, Minus } from "lucide-react";
// using plain div for collapse so CSS .open controls max-height

const parseTitle = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
};

const stripFormatting = (text) => {
  if (!text) return "";
  // remove HTML tags
  const noHtml = text.replace(/<[^>]+>/g, "");
  // remove common markdown tokens
  return noHtml.replace(/\*\*|__|\*|`|_/g, "").replace(/\s+/g, " ").trim();
};
import LegalContentBlock from "./LegalContentBlock";
import LegalSubSection from "./LegalSubSection";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import LegalNumberedSubSections from "./LegalNumberedSubSections";

export default function LegalSection({ section, isEditing, onChange, sectionIndex, sectionNumber }) {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = React.useRef(null);

  const handleContentChange = (blockIdx, newBlock) => {
    const newContent = [...(section.content || [])];
    newContent[blockIdx] = newBlock;
    onChange({ ...section, content: newContent });
  };

  const removeContentBlock = (blockIdx) => {
    onChange({
      ...section,
      content: (section.content || []).filter((_, i) => i !== blockIdx),
    });
  };

  const moveContentUp = (blockIdx) => {
    if (blockIdx === 0) return;
    const newContent = [...(section.content || [])];
    [newContent[blockIdx - 1], newContent[blockIdx]] = [newContent[blockIdx], newContent[blockIdx - 1]];
    onChange({ ...section, content: newContent });
  };

  const moveContentDown = (blockIdx) => {
    const content = section.content || [];
    if (blockIdx === content.length - 1) return;
    const newContent = [...content];
    [newContent[blockIdx], newContent[blockIdx + 1]] = [newContent[blockIdx + 1], newContent[blockIdx]];
    onChange({ ...section, content: newContent });
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
      onChange({ ...section, content: [...(section.content || []), newBlock] });
    }
  };

  const sectionId = `section-${sectionNumber}`;

  React.useEffect(() => {
    const handleInternalLink = (e) => {
      // find the closest anchor in case the user clicked an inner element
      const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
      if (anchor && anchor.dataset && anchor.dataset.internalLink) {
        e.preventDefault();
        const anchorId = anchor.dataset.internalLink;
        
        // Check if this section or any subsection matches
        if (anchorId === sectionId || anchorId.startsWith(`subsection-${sectionNumber}-`)) {
          setIsOpen(true);
          
          // Wait for the section to open
          setTimeout(() => {
            // If it's a subsection, trigger its opening too
            const element = document.getElementById(anchorId);
            if (element) {
                // Trigger a custom event to open nested subsections
                const openEvent = new CustomEvent('openSubSection', { detail: { anchorId } });
                document.dispatchEvent(openEvent);
              // Scroll after giving time for all sections to open
                  setTimeout(() => {
                    // prefer focusing the content region (has tabindex=-1) so screen readers land there
                    const contentEl = document.getElementById(`${anchorId}-content`);
                    if (contentEl) {
                      try {
                        // ensure tabindex is present so programmatic focus is allowed
                        contentEl.setAttribute('tabindex', '-1');
                        contentEl.focus();
                      } catch (err) {}
                      // ensure it is visible
                      contentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // log active element and whether focus moved (kept out of production logs)
                    } else {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 150);
            }
          }, 100);
        }
      }
    };

    document.addEventListener('click', handleInternalLink);
    return () => document.removeEventListener('click', handleInternalLink);
  }, [sectionId, sectionNumber]);
  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        // after animation, move focus into content for screen-reader users
        setTimeout(() => {
          const el = document.getElementById(`${sectionId}-content`);
          if (el) el.focus();
        }, 260);
      }
      return next;
    });
  };

  return (
    <div className="sectionWrapper" id={sectionId} ref={sectionRef}>

      <button
        onClick={toggleOpen}
        className="sectionButton"
        aria-expanded={isOpen}
        aria-controls={`${sectionId}-content`}
        aria-describedby={`${sectionId}-title`}
      >
        <div className="sectionToggleGroup">
          <div className={isOpen ? "sectionCircle sectionCircleOpen" : "sectionCircle"}>
            {isOpen ? (
              <Minus className="sectionCircleIcon" />
            ) : (
              <Plus className="sectionCircleIcon" />
            )}
          </div>
          <span className="sectionNumber" style={/\*\*/.test(section.title) ? { fontWeight: 700 } : {}}>{sectionNumber}.</span>
        </div>
        {isEditing ? (
          <Input
            value={section.title}
            onChange={(e) => {
              e.stopPropagation();
              onChange({ ...section, title: e.target.value });
            }}
            id={`${sectionId}-title`}
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
              <Heading
                id={`${sectionId}-title`}
                depth={0}
                html={parseTitle(section.title)}
                style={{ fontWeight: 700, fontSize: '20px' }}
              />
            );
          })()
        )}
      </button>

      <div
        id={`${sectionId}-content`}
        className={isOpen ? "sectionContentWrapper open" : "sectionContentWrapper"}
        role="region"
        aria-hidden={!isOpen}
        tabIndex={-1}
      >
        <div className="sectionContent" style={{ opacity: isOpen ? 1 : 0, transition: 'opacity .18s ease' }}>
              {(section.content || []).map((block, blockIdx) => (
                <div key={blockIdx} className="relative group/block">
                  {isEditing && (
                    <div className="absolute -right-8 top-0 flex gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity z-10">
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
                        disabled={blockIdx === (section.content || []).length - 1}
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
                      onChange={(newSub) => handleContentChange(blockIdx, { type: "subsection", ...newSub })}
                      depth={0}
                      numbering={`${sectionNumber}.${blockIdx + 1}`}
                      parentNumbering={`${sectionNumber}`}
                    />
                  ) : block.type === "numbered_subsections" ? (
                    <LegalNumberedSubSections
                      block={block}
                      isEditing={isEditing}
                      onChange={(newBlock) => handleContentChange(blockIdx, newBlock)}
                      parentNumbering={`${sectionNumber}`}
                    />
                  ) : (
                    <LegalContentBlock
                      block={block}
                      isEditing={isEditing}
                      onChange={(newBlock) => handleContentChange(blockIdx, newBlock)}
                      parentNumbering={sectionNumber}
                    />
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="flex items-center gap-2 pt-4 border-t border-dashed border-gray-200 mt-4">
                  <span className="text-xs text-gray-400 font-medium">הוסף בלוק:</span>
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
                        className="text-xs h-7 px-2.5"
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
          </div>
    </div>
  );
}