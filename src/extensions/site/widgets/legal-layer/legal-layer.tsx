import React, { useState } from 'react';
import type { LegalDocument } from '../../types/legal';
import styles from './legal-layer.module.css';

interface Props {
  document?: LegalDocument;
  onSave?: (doc: LegalDocument) => void;
}

const sampleDocument: LegalDocument = {
  title: "תנאי שימוש – דוגמה",
  subtitle: "מסמך לדוגמה בעברית",
  effective_date: "2026-02-16",
  preamble: [
    { type: "paragraph", text: "זהו טקסט פתיחה של המסמך." }
  ],
  sections: [
    {
      id: "sec1",
      title: "הסעיף הראשון",
      content: [
        { type: "paragraph", text: "פסקה ראשונה בתוך הסעיף." },
        { type: "heading", text: "כותרת משנה" },
        { type: "bullets", items: ["נקודה 1", "נקודה 2"] }
      ]
    },
    {
      id: "sec2",
      title: "הסעיף השני",
      content: [
        { type: "paragraph", text: "פסקה לדוגמה בסעיף השני." },
        { type: "table", data: { headers: ["כותרת א", "כותרת ב"], rows: [["1", "2"], ["3", "4"]] } }
      ]
    }
  ]
};


const LegalLayer: React.FC<Props> = ({ document }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<LegalDocument | null>(null);

  // נשתמש ב-sampleDocument אם לא מועבר prop
  const doc = document ?? sampleDocument;
  console.log("LegalLayer doc:", doc);

  const startEditing = () => {
    const deepClone = JSON.parse(JSON.stringify(doc));
    setEditData(deepClone);
    setIsEditing(true);
  };

  const saveChanges = () => {
    if (editData) {
      console.log("Saving changes:", editData);
    }
    setIsEditing(false);
  };

  return (
    <div dir="rtl" className={styles.container}>
  <h2 className={styles.title}>{doc.title}</h2>
  <h4 className={styles.subtitle}>{doc.subtitle}</h4>
  <p className={styles.date}>{doc.effective_date}</p>

  {doc.sections.map((section) => (
    <div key={section.id} className={styles.section}>
      <div className={styles.sectionTitle}>{section.title}</div>

      {section.content.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className={styles.paragraph}>
                {block.text}
              </p>
            );

          case "heading":
            return (
              <div key={i} className={styles.heading}>
                {block.text}
              </div>
            );

          case "bullets":
            return (
              <ul key={i} className={styles.bulletList}>
                {block.items.map((item, idx) => (
                  <li key={idx}>{typeof item === "string" ? item : item.text}</li>
                ))}
              </ul>
            );

          case "table":
            return (
              <table key={i} className={styles.table}>
                <thead>
                  <tr>
                    {block.data.headers.map((hdr, idx) => (
                      <th key={idx}>{hdr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.data.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );

          default:
            return null;
        }
      })}
    </div>
  ))}
</div>
  );
};
export default LegalLayer;



