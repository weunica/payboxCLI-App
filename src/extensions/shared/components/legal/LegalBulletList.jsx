/**
 * LegalBulletList Component
 * 
 * A recursive bullet list component that supports nested lists, rich text formatting,
 * and editing capabilities. Handles markdown-style formatting and link parsing.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array<string|Object>} props.items - List items. Can be strings or objects with { text, children }
 * @param {boolean} props.isEditing - Whether the component is in edit mode
 * @param {Function} props.onChange - Callback function when items change. Receives updated items array
 * @param {number} [props.level=0] - Nesting level of the list (0=disc, 1=circle, 2=square)
 * 
 * @returns {React.ReactElement} Rendered bullet list with conditional edit controls
 * 
 * @example
 * const [items, setItems] = useState(['Item 1', 'Item 2']);
 * <LegalBulletList 
 *   items={items} 
 *   isEditing={true} 
 *   onChange={setItems} 
 *   level={0}
 * />
 * 
 * @description
 * In edit mode: Displays textarea for each item with controls (move up/down, delete, add sub-list)
 * In view mode: Renders formatted HTML with support for:
 * - **bold** text using **text**
 * - __underlined__ text using __text__
 * - [link text](url) for external links (opens in new tab)
 * - [link text](#anchor) for internal links
 * 
 * Supports recursive nested lists up to any depth level.
 */
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

export default function LegalBulletList({ items, isEditing, onChange, level = 0 }) {
  const listClass = level === 0 ? "bulletListDisc" : level === 1 ? "bulletListCircle" : "bulletListSquare";

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
      <ul className={listClass}>
        {items.map((item, idx) => {
          const text = typeof item === "string" ? item : item.text;
          const children = typeof item === "object" ? item.children : null;

          return (
            <li key={idx} className="bulletItem">
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
                        title="הוסף תת-רשימה"
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
                <LegalBulletList
                  items={children}
                  isEditing={isEditing}
                  onChange={(newSubItems) => handleSubItemsChange(idx, newSubItems)}
                  level={level + 1}
                />
              )}
            </li>
          );
        })}
      </ul>
      {isEditing && (
        <Button variant="ghost" size="sm" onClick={addItem} className="mt-1 text-xs text-blue-600">
          <Plus className="h-3 w-3 ml-1" />
          הוסף פריט
        </Button>
      )}
    </div>
  );
}