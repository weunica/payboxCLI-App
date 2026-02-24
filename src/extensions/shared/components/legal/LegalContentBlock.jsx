import React from "react";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import LegalBulletList from "./LegalBulletList";
import LegalNumberedList from "./LegalNumberedList";
import LegalTable from "./LegalTable";


const parseTextWithLinks = (text) => {
  // First apply bold and underline
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
  
  // Then parse links: [text](url) or [text](#anchor)
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

export default function LegalContentBlock({ block, isEditing, onChange, parentNumbering }) {
  if (!block) return null;
  const type = block.type;

  if (type === "paragraph") {
    return isEditing ? (
      <div className="my-2">
        <Textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          className="text-sm resize-none overflow-hidden"
          style={{ height: 'auto', minHeight: '60px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
      </div>
    ) : (
      <p
        className="paragraph"
        dangerouslySetInnerHTML={{
          __html: parseTextWithLinks(block.text)
        }}
      />
    );
  }

  if (type === "heading") {
    return isEditing ? (
      <div className="my-2">
        <Input
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          className="text-sm font-bold"
        />
      </div>
    ) : (
      <h4
        className="heading"
        dangerouslySetInnerHTML={{
          __html: parseTextWithLinks(block.text)
        }}
      />
    );
  }

  if (type === "bullets") {
    return (
      <div className="contentBlockWrapper">
        <LegalBulletList
          items={block.items}
          isEditing={isEditing}
          onChange={(newItems) => onChange({ ...block, items: newItems })}
        />
      </div>
    );
  }

  if (type === "numbered_list") {
    return (
      <div className="contentBlockWrapper">
        <LegalNumberedList
          items={block.items}
          isEditing={isEditing}
          onChange={(newItems) => onChange({ ...block, items: newItems })}
          prefix={parentNumbering ? `${parentNumbering}.` : ""}
        />
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="contentBlockWrapper">
        <LegalTable
          data={block.data}
          isEditing={isEditing}
          onChange={(newData) => onChange({ ...block, data: newData })}
        />
      </div>
    );
  }

  return null;
}