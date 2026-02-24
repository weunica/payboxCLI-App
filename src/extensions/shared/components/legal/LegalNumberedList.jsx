import React from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const parseTextWithLinks = (text) => {
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

export default function LegalNumberedList({ items, isEditing, onChange, level = 0, prefix = "", parentPrefix = "" }) {
  const listClass = level === 0 ? "numberedList" : "numberedListIndented";
  
  // Use the provided prefix if it exists, otherwise use parentPrefix for nested lists
  const basePrefix = level === 0 && prefix ? prefix : parentPrefix;

  const handleItemChange = (idx, value) => {
    const newItems = items.map((item, i) => {
      if (i !== idx) return item;
      if (typeof item === "string") return value;
      return { ...item, text: value };
    });
    onChange(newItems);
  };

  const handleSubItemsChange = (idx, newSubItems) => {
    const newItems = items.map((item, i) => {
      if (i !== idx) return item;
      if (typeof item === "string") return { text: item, children: newSubItems };
      return { ...item, children: newSubItems };
    });
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const moveItemUp = (idx) => {
    if (idx === 0) return;
    const newItems = [...items];
    [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    onChange(newItems);
  };

  const moveItemDown = (idx) => {
    if (idx === items.length - 1) return;
    const newItems = [...items];
    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    onChange(newItems);
  };

  const addSubList = (idx) => {
    const item = items[idx];
    const text = typeof item === "string" ? item : item.text;
    const newItems = [...items];
    newItems[idx] = { text, children: [""] };
    onChange(newItems);
  };

  return (
    <div>
      <ol className={listClass} style={{ counterReset: 'item' }}>
        {items.map((item, idx) => {
          const text = typeof item === "string" ? item : item.text;
          const children = typeof item === "object" ? item.children : null;
          const currentNumber = idx + 1;
          const currentPrefix = basePrefix ? `${basePrefix}${currentNumber}` : `${currentNumber}`;
          const nestedPrefix = `${currentPrefix}.`;

          return (
            <li key={idx} className="numberedItem" style={{ counterIncrement: 'item' }}>
              <div className="numberedItemRow">
                <span className="numberedItemPrefix">{currentPrefix}.</span>
                <div className="numberedItemBody">
                  {isEditing ? (
                    <div className="flex items-start gap-1 mb-1">
                      <div className="flex-1">
                        <Textarea
                          value={text}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          className="text-sm resize-none overflow-hidden"
                          style={{ height: 'auto', minHeight: '36px' }}
                          onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => moveItemUp(idx)}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="h-3 w-3 text-gray-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => moveItemDown(idx)}
                          disabled={idx === items.length - 1}
                        >
                          <ArrowDown className="h-3 w-3 text-gray-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                        {!children && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => addSubList(idx)}
                            title="הוסף תת-רשימה ממוספרת"
                          >
                            <Plus className="h-3 w-3 text-blue-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: parseTextWithLinks(text) }} />
                  )}
                  {children && children.length > 0 && (
                    <div className="numberedItemSubList">
                      <LegalNumberedList
                        items={children}
                        isEditing={isEditing}
                        onChange={(newSubItems) => handleSubItemsChange(idx, newSubItems)}
                        level={level + 1}
                        parentPrefix={nestedPrefix}
                      />
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {isEditing && (
        <Button variant="ghost" size="sm" onClick={addItem} className="mt-1 text-xs text-blue-600">
          <Plus className="h-3 w-3 ml-1" />
          הוסף פריט
        </Button>
      )}
    </div>
  );
}