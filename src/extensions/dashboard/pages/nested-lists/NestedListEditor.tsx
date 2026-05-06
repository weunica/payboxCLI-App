import React, { useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextButton,
  Text,
  Tooltip,
} from '@wix/design-system';
import { Add, Delete } from '@wix/wix-ui-icons-common';
import type { ListItem, ListItemType } from './types';

interface Props {
  items: ListItem[];
  prefix?: string;
  depth?: number;
  onChange: (items: ListItem[]) => void;
}

const MAX_DEPTH = 4;

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const parseTitle = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" aria-description="נפתח בכרטיסיה חדשה">$1</a>');
};

// Textarea that auto-resizes to content height on mount and on every value change
const AutoResizeTextarea: React.FC<{
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}> = ({ value, placeholder, onChange, onFocus, onBlur }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      dir="rtl"
      rows={1}
      placeholder={placeholder}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        width: '100%',
        resize: 'none',
        overflow: 'hidden',
        fontFamily: 'inherit',
        fontSize: '14px',
        padding: '6px 10px',
        border: '1px solid #C1C2C3',
        borderRadius: '6px',
        boxSizing: 'border-box',
        lineHeight: '1.5',
        direction: 'rtl',
        textAlign: 'right',
        outline: 'none',
        display: 'block',
      }}
    />
  );
};

const FormattingHint: React.FC = () => (
  <div style={{
    background: '#F0F4FF',
    border: '1px solid #D6E1FF',
    borderRadius: '8px',
    padding: '10px 14px',
    direction: 'rtl',
    textAlign: 'right',
  }}>
    <div style={{ fontWeight: 600, fontSize: '13px', color: '#32536A', marginBottom: '8px' }}>
      עיצוב טקסט
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {[
              { label: 'בולד', syntax: '**טקסט מודגש**', preview: <strong>טקסט מודגש</strong> },
        { label: 'קו תחתי', syntax: '__טקסט עם קו תחתי__', preview: <u>טקסט עם קו תחתי</u> },
        { label: 'קישור', syntax: '[קישור](https://...)', preview: <span style={{ textDecoration: 'underline' }}>קישור</span> },
      ].map(({ label, syntax, preview }) => (
        <div key={label} style={{
          background: 'white',
          border: '1px solid #C1C2C3',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '12px',
          color: '#32536A',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>{preview}</span>
          <span style={{ color: '#9B9B9B', fontFamily: 'monospace' }}>{syntax}</span>
        </div>
      ))}
    </div>
  </div>
);

const NestedListEditor: React.FC<Props> = ({
  items,
  prefix = '',
  depth = 0,
  onChange,
}) => {
  const addItem = () => {
    onChange([...items, { id: makeId(), type: 'item', title: '', children: [] }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateTitle = (index: number, title: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, title } : item)));
  };

  const updateChildren = (index: number, children: ListItem[]) => {
    onChange(items.map((item, i) => (i === index ? { ...item, children } : item)));
  };

  const addChild = (index: number) => {
    const item = items[index];
    if (!item) return;
    updateChildren(index, [
      ...(item.children ?? []),
      { id: makeId(), type: 'item', title: '', children: [] },
    ]);
  };

  const updateType = (index: number, type: ListItemType) => {
    onChange(items.map((item, i) => {
      if (i !== index) return item;
      // When switching away from 'item', clear children and description
      if (type !== 'item') {
        const { children: _c, description: _d, ...rest } = item;
        return { ...rest, type };
      }
      return { ...item, type };
    }));
  };

  const toggleDescription = (index: number) => {
    const item = items[index];
    if (!item) return;
    if (item.description !== undefined) {
      // remove description
      const { description: _d, ...rest } = item;
      onChange(items.map((it, i) => i === index ? rest : it));
    } else {
      onChange(items.map((it, i) => i === index ? { ...it, description: '' } : it));
    }
  };

  const updateDescription = (index: number, description: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, description } : item)));
  };

  return (
    <Box direction="vertical" gap="SP2">
      {depth === 0 && <FormattingHint />}
      {(() => {
        // Pre-compute number labels — skip non-item types in the counter
        let counter = 0;
        const numberLabels = items.map(item => {
          const isItem = !item.type || item.type === 'item';
          if (isItem) counter++;
          return isItem ? (prefix ? `${prefix}.${counter}` : `${counter}`) : null;
        });

        return items.map((item, index) => {
          const numberLabel = numberLabels[index];
          const isItem = numberLabel !== null;

          const titlePlaceholder =
            item.type === 'text-block' ? 'טקסט חופשי (16px)' :
            item.type === 'heading-block' ? 'כותרת נוספת (bold)' :
            depth === 0 ? 'כותרת רשימה ראשית' : 'פריט';

          return (
            <Box key={item.id} direction="vertical" gap="SP1">
              {/* Main row */}
              <Box align="center" gap="SP2">
                {depth > 0 && <div style={{ width: `${depth * 20}px`, flexShrink: 0 }} />}
                {/* Type selector */}
                <select
                  value={item.type ?? 'item'}
                  dir="rtl"
                  onChange={(e) => updateType(index, e.target.value as ListItemType)}
                  style={{
                    fontSize: '11px',
                    height: '28px',
                    padding: '0 4px',
                    borderRadius: '4px',
                    border: '1px solid #C1C2C3',
                    cursor: 'pointer',
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    background: isItem ? 'white' : '#EEF3FE',
                    color: '#32536A',
                  }}
                >
                  <option value="item">פריט</option>
                  <option value="text-block">טקסט</option>
                  <option value="heading-block">כותרת</option>
                </select>
                {/* Text size selector for text-block */}
                {item.type === 'text-block' && (
                  <select
                    value={item.textSize || 'small'}
                    dir="rtl"
                    onChange={e => {
                      const textSize = e.target.value as 'small' | 'normal';
                      onChange(items.map((it, i) => i === index ? { ...it, textSize } : it));
                    }}
                    style={{
                      fontSize: '11px',
                      height: '28px',
                      padding: '0 4px',
                      borderRadius: '4px',
                      border: '1px solid #C1C2C3',
                      cursor: 'pointer',
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      marginRight: '8px',
                      background: '#F5F6F7',
                      color: '#32536A',
                    }}
                  >
                    <option value="small">טקסט קטן (16px)</option>
                    <option value="normal">טקסט רגיל (19.2px)</option>
                  </select>
                )}
                {/* Number badge */}
                <div style={{ minWidth: '40px', flexShrink: 0 }}>
                  {numberLabel && (
                    <Text size="small" secondary weight={depth === 0 ? 'bold' : 'normal'}>
                      {numberLabel}
                    </Text>
                  )}
                </div>
                {/* Title + description stacked in same flex column */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <Tooltip content={
                    item.title
                      ? <span dangerouslySetInnerHTML={{ __html: parseTitle(item.title) }} />
                      : 'הזן טקסט'
                  }>
                    <AutoResizeTextarea
                      value={item.title}
                      placeholder={titlePlaceholder}
                      onChange={(e) => updateTitle(index, e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = '#116DFF'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#C1C2C3'; }}
                    />
                  </Tooltip>
                  {/* Description — only at root depth */}
                  {isItem && depth === 0 && item.description !== undefined && (
                    <div style={{ marginTop: '4px' }}>
                      <AutoResizeTextarea
                        value={item.description}
                        placeholder="תיאור / טקסט נוסף מתחת לכותרת"
                        onChange={(e) => updateDescription(index, e.target.value)}
                        onFocus={(e) => { e.target.style.borderColor = '#116DFF'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#C1C2C3'; }}
                      />
                    </div>
                  )}
                </div>
                {/* +child button — only for item type */}
                {isItem && depth < MAX_DEPTH && (
                  <IconButton
                    size="tiny"
                    skin="light"
                    onClick={() => addChild(index)}
                    tooltipProps={{ content: 'הוסף תת-פריט' }}
                  >
                    <Add />
                  </IconButton>
                )}
                {/* +description toggle — only for root item types */}
                {isItem && depth === 0 && (
                  <button
                    onClick={() => toggleDescription(index)}
                    title={item.description !== undefined ? 'הסר תיאור' : 'הוסף תיאור'}
                    style={{
                      fontSize: '11px',
                      height: '28px',
                      padding: '0 6px',
                      borderRadius: '4px',
                      border: '1px solid #C1C2C3',
                      cursor: 'pointer',
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      background: item.description !== undefined ? '#EEF3FE' : 'white',
                      color: '#32536A',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.description !== undefined ? '−תיאור' : '+תיאור'}
                  </button>
                )}
                {/* Delete */}
                <IconButton
                  size="tiny"
                  skin="destructive"
                  onClick={() => removeItem(index)}
                  tooltipProps={{ content: 'מחק' }}
                >
                  <Delete />
                </IconButton>
              </Box>
              {/* Children editor — only for item type */}
              {isItem && (item.children?.length ?? 0) > 0 && (
                <NestedListEditor
                  items={item.children ?? []}
                  prefix={numberLabel ?? ''}
                  depth={depth + 1}
                  onChange={(children) => updateChildren(index, children)}
                />
              )}
            </Box>
          );
        });
      })()}
      <TextButton size="small" prefixIcon={<Add />} onClick={addItem}>
        {depth === 0 ? 'הוסף פריט ראשי' : 'הוסף פריט'}
      </TextButton>
    </Box>
  );
};

export default NestedListEditor;
