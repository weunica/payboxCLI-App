import React, { useEffect, useState } from "react";
import LegalDocumentView from "./legal/LegalDocumentView";
import { getLegalDocument, saveLegalDocument } from "../backend/legalDocument.web";
import type { LegalDocument } from "../types/legalDocument";
import '../styles/legal.css';
import '../styles/legal-scope.css';

interface Props {
  readOnly?: boolean;
  defaultDocument: LegalDocument;
}

const LegalAgreementRoot: React.FC<Props> = ({
  readOnly = false,
  defaultDocument,
}) => {
  const [documentData, setDocumentData] = useState<LegalDocument>(defaultDocument);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const doc = await getLegalDocument();

      if (doc) {
        const legalDoc: LegalDocument = {
          title: doc.title || "",
          subtitle: doc.subtitle || "",
          effective_date: doc.effective_date || "",
          preamble: doc.preamble || [],
          sections: doc.sections || [],
        };
        setDocumentData(legalDoc);
      }

      setIsLoading(false);
    }

    fetchData();
  }, []);

  // debug overlay removed

  const handleSave = async (updatedData: LegalDocument) => {
    if (readOnly) return;

    const savedDoc = await saveLegalDocument(updatedData);
    const saved: LegalDocument = {
      title: savedDoc.title || "",
      subtitle: savedDoc.subtitle || "",
      effective_date: savedDoc.effective_date || "",
      preamble: savedDoc.preamble || [],
      sections: savedDoc.sections || [],
    };
    setDocumentData(saved);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="legal-scope" dir="rtl" style={{ padding: readOnly ? "0" : "32px" }}>
      <LegalDocumentView
        document={documentData}
        onSave={readOnly ? undefined : handleSave}
      />
    </div>
  );
};

export default LegalAgreementRoot;
