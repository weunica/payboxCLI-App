export interface LegalDocument {
  title: string;
  subtitle?: string;
  effective_date?: string;
  preamble?: ContentBlock[];
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  numbering?: string;
  content: ContentBlock[];
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullets"; items: BulletItem[] }
  | { type: "table"; data: { headers: string[]; rows: string[][] } }
  | { type: "subsection"; title: string; content: ContentBlock[] };

export type BulletItem =
  | string
  | { text: string; children: string[] };
