import React, { type FC, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { items } from '@wix/data';

type ListItemType = 'item' | 'text-block' | 'heading-block';

interface ListItem {
  id: string;
  type?: ListItemType;
  title: string;
  description?: string;
  children?: ListItem[];
  /** For text-block: 'small' (16px) or 'normal' (19.2px) */
  textSize?: 'small' | 'normal';
}

const parseTitle = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">$1</a>')
    .replace(/\n/g, '<br>');
};

// Block item (text-block / heading-block) — no numbering
const BlockItem: FC<{ item: ListItem; depth: number }> = ({ item, depth }) => {
  const isHeading = item.type === 'heading-block';
  const isTextBlock = item.type === 'text-block';
  const textSize = isTextBlock ? (item.textSize === 'normal' ? '19.2px' : '16px') : '16px';
  return (
    <div style={{
      padding: isHeading ? '32px 0' : '16px 0',
    }}>
      {isHeading ? (
        <h3
          style={{
            fontSize: '22.5px',
            fontWeight: 700,
            color: '#272726',
            lineHeight: '1.6',
            fontFamily: "'Assistant', sans-serif",
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: parseTitle(item.title) }}
        />
      ) : (
        <span
          style={{
            fontSize: textSize,
            fontWeight: 400,
            color: '#272726',
            lineHeight: '1.6',
            fontFamily: "'Assistant', sans-serif",
          }}
          dangerouslySetInnerHTML={{ __html: parseTitle(item.title) }}
        />
      )}
    </div>
  );
};

interface NestedItemProps {
  item: ListItem;
  numbering: string;
  depth: number;
}

const NestedItem: FC<NestedItemProps> = ({ item, numbering, depth }) => {
  const isRoot = depth === 0;
  const children = item.children ?? [];

  // compute per-child numbering, skipping non-item types
  let childCounter = 0;
  // Filter only 'item' children for the list
  const itemChildren = children.filter(child => !child.type || child.type === 'item');
  // Non-item children (blocks)
  const blockChildren = children.filter(child => child.type && child.type !== 'item');

  return (
    <div style={{ padding: isRoot ? '10px 0' : '0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '3px 0',
        }}
      >
        <span style={{
          flexShrink: 0,
          fontSize: isRoot ? '22.5px' : '19.2px',
          fontWeight: 400,
          color: '#272726',
          lineHeight: '1.5',
          fontFamily: "'Assistant', sans-serif",
        }}>
          {numbering}.
        </span>
        <span
          style={{
            flex: 1,
            fontWeight: isRoot ? 600 : 400,
            color: '#272726',
            lineHeight: '1.5',
            fontFamily: "'Assistant', sans-serif",
          }}
        >
          {isRoot ? (
            <h3
              style={{
                fontSize: '22.5px',
                fontWeight: 600,
                color: '#272726',
                lineHeight: '1.5',
                fontFamily: "'Assistant', sans-serif",
                margin: 0,
              }}
              dangerouslySetInnerHTML={{ __html: parseTitle(item.title) }}
            />
          ) : (
            <span
              style={{
                fontSize: '19.2px',
                fontWeight: 400,
                color: '#272726',
                lineHeight: '1.5',
                fontFamily: "'Assistant', sans-serif",
              }}
              dangerouslySetInnerHTML={{ __html: parseTitle(item.title) }}
            />
          )}
        </span>
      </div>
      {item.description && (
        <div style={{ paddingRight: '8px', margin: '6px 0 4px' }}>
          <span
            style={{
              fontSize: '19.2px',
              fontWeight: 400,
              color: '#272726',
              lineHeight: '1.6',
              fontFamily: "'Assistant', sans-serif",
            }}
            dangerouslySetInnerHTML={{ __html: parseTitle(item.description) }}
          />
        </div>
      )}
      {children.length > 0 && (
        <div style={{ paddingRight: '24px', marginTop: isRoot ? '16px' : '2px' }}>
          {children.map((child) => {
            if (!child.type || child.type === 'item') {
              childCounter++;
              return (
            <NestedItem
              key={child.id}
              item={child}
                  numbering={`${numbering}.${childCounter}`}
              depth={depth + 1}
            />
              );
            }
            return <BlockItem key={child.id} item={child} depth={depth + 1} />;
          })}
        </div>
      )}
    </div>
  );
};

interface WidgetProps {
  pageName: string;
}

const NestedListComponent: FC<WidgetProps> = ({ pageName }) => {
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!pageName) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      try {
        const result = await items
          .query('@payboxapp/qr-script/nested-dynamic-lists')
          .eq('page_name', pageName)
          .limit(1)
          .find();
        if (result.items.length > 0) {
          const data = result.items[0].list_data as { items: ListItem[] };
          setListItems(data?.items || []);
        }
      } catch (err) {
        console.error('[nested-list] Failed to load:', err);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [pageName]);

  if (loading || !pageName || listItems.length === 0) return null;

  let rootCounter = 0;

  return (
    <div style={{
      fontFamily: "'Assistant', sans-serif",
      direction: 'rtl',
      width: '100%',
      boxSizing: 'border-box',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      {listItems.map((item) => {
            if (!item.type || item.type === 'item') {
          rootCounter++;
              return (
                <NestedItem
                  key={item.id}
                  item={item}
              numbering={`${rootCounter}`}
                  depth={0}
                />
              );
            }
            return <BlockItem key={item.id} item={item} depth={0} />;
          })}
    </div>
  );
};

const nestedListStyles = `
@font-face {
  font-family: 'Assistant';
  font-style: normal;
  font-weight: 200 800;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/assistant/v24/2sDcZGJYnIjSi6H75xkzamW5Kb8VZBHR.woff2) format('woff2');
  unicode-range: U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F;
}
@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200..800&display=swap');
`;

export default class NestedListWidgetElement extends HTMLElement {
  private root: any;

  static get observedAttributes() {
    return ['page-name'];
  }

  connectedCallback() {
    const styleId = 'nested-list-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = nestedListStyles;
    this.root = createRoot(this);
    this.root.render(<NestedListComponent pageName={this.getAttribute('page-name') || ''} />);
  }

  attributeChangedCallback() {
    if (this.root) {
      this.root.render(<NestedListComponent pageName={this.getAttribute('page-name') || ''} />);
    }
  }

  disconnectedCallback() {
    this.root?.unmount();
  }
}
