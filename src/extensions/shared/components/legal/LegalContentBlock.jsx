import React, { useEffect, useRef } from "react";
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
      const rawAnchor = url.substring(1);
      // normalize anchor ids: replace dots with hyphens so e.g. 4.1 -> 4-1
      let anchorId = rawAnchor.replace(/\./g, '-');
      // If anchor is numeric (e.g. "4-1" or "4.1") and doesn't already include the prefix,
      // prefix it with 'subsection-' so it matches element ids like 'subsection-4-1'
      if (!anchorId.startsWith('subsection-') && /^[0-9]/.test(anchorId)) {
        anchorId = `subsection-${anchorId}`;
      }
      // Link the anchor to the subsection title for screen reader users using aria-describedby.
      // The subsection titles render with id `${subSectionId}-title` in `LegalSubSection`.
      const describedById = `${anchorId}-title`;
      return `<a href="#${anchorId}" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" data-internal-link="${anchorId}" aria-describedby="${describedById}">${linkText}</a>`;
    } else {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-description="נפתח בכרטיסיה חדשה" class="text-blue-600 hover:text-blue-800 underline">${linkText}</a>`;
    }
  });
  
  return html;
};

export default function LegalContentBlock({ block, isEditing, onChange, parentNumbering }) {
  if (!block) return null;
  const type = block.type;

  const containerRef = useRef(null);

  useEffect(() => {
    if (isEditing) return; // don't update aria-labels while editing
    const root = containerRef.current;
    if (!root) return;

    const links = Array.from(root.querySelectorAll('a[data-internal-link]'));
    links.forEach((link) => {
      try {
        const internal = link.dataset.internalLink;
        if (!internal) return;
        const targetId = `${internal}-title`;
        const targetEl = document.getElementById(targetId);
        const linkText = (link.textContent || '').trim();
        const targetText = targetEl ? (targetEl.textContent || '').trim() : '';
        const ariaLabel = targetText ? `${linkText} - ${targetText}` : linkText;
        link.setAttribute('aria-label', ariaLabel);
      } catch (err) {
        // ignore
      }
    });
  }, [block, isEditing]);

  // Helper: render semantic heading based on parentNumbering depth
  const Heading = ({ depth, html, style }) => {
    const level = Math.min(6, 3 + depth);
    const tag = `h${level}`;
    return React.createElement(tag, { style: { margin: 0, ...style }, dangerouslySetInnerHTML: { __html: html } });
  };

  if (type === "paragraph") {
    return (
      <div ref={containerRef}>
        {isEditing ? (
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
        )}
      </div>
    );
  }

  if (type === "heading") {
    return (
      <div ref={containerRef}>
        {isEditing ? (
          <div className="my-2">
            <Input
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              className="text-sm font-bold"
            />
          </div>
        ) : (
          (() => {
            const depth = parentNumbering ? parentNumbering.toString().split('.').length : 0;
            return (
              <Heading
                depth={depth}
                html={parseTextWithLinks(block.text)}
                style={{
                  fontFamily: 'Assistant, sans-serif',
                }}
              />
            );
          })()
        )}
      </div>
    );
  }

  if (type === "bullets") {
    return (
      <div ref={containerRef} className="contentBlockWrapper">
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
      <div ref={containerRef} className="contentBlockWrapper">
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
      <div ref={containerRef} className="contentBlockWrapper">
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