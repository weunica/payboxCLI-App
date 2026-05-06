import React, { type FC, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import reactToWebComponent from "react-to-webcomponent";

// Types
interface TermsOfUseItem {
  _id: string;
  _createdDate: string;
  _updatedDate: string;
  title?: string;
  content?: string;
  contentType?: "section" | "list" | "paragraph";
  parentId?: string;
  level?: number;
}

interface TermsSection extends TermsOfUseItem {
  children?: TermsSection[];
}

interface WidgetProps {
  initialExpanded?: string;
  animationSpeed?: string;
  colorTheme?: string;
  dataJson?: string;
}

// Sample data structure for demo
const SAMPLE_TERMS: TermsSection[] = [
  {
    _id: "section-1",
    _createdDate: new Date().toISOString(),
    _updatedDate: new Date().toISOString(),
    title: "General Terms",
    content: "Welcome to our service. These terms govern your use of our platform.",
    contentType: "section",
    level: 0,
    children: [
      {
        _id: "section-1-1",
        _createdDate: new Date().toISOString(),
        _updatedDate: new Date().toISOString(),
        title: "Acceptance of Terms",
        content: "By accessing and using this service, you accept and agree to be bound by the terms.",
        contentType: "paragraph",
        level: 1,
        parentId: "section-1",
      },
    ],
  },
  {
    _id: "section-2",
    _createdDate: new Date().toISOString(),
    _updatedDate: new Date().toISOString(),
    title: "User Responsibilities",
    content: "Users must follow these guidelines:",
    contentType: "section",
    level: 0,
    children: [
      {
        _id: "section-2-1",
        _createdDate: new Date().toISOString(),
        _updatedDate: new Date().toISOString(),
        title: "Conduct",
        content: "Treat all users with respect\nFollow community guidelines\nNo harassment or abuse",
        contentType: "list",
        level: 1,
        parentId: "section-2",
      },
    ],
  },
];

const TermsOfUseAccordion: FC<WidgetProps> = ({
  initialExpanded = "all",
  animationSpeed = "300",
  colorTheme = "default",
  dataJson,
}): JSX.Element => {
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const animSpeed = parseInt(animationSpeed) || 300;

  // Load initial expansion state
  useEffect(() => {
    if (initialExpanded === "all") {
      setExpandedItems(new Set());
    } else {
      setExpandedItems(new Set());
    }
  }, [initialExpanded]);

  // Load data (sample or from prop)
  useEffect(() => {
    const loadData = async () => {
      try {
        let data: TermsSection[] = [];

        // Try to parse data from prop first
        if (dataJson) {
          try {
            data = JSON.parse(dataJson);
          } catch (e) {
            console.warn("Failed to parse dataJson prop, using sample data");
            data = SAMPLE_TERMS;
          }
        } else {
          // Use sample data
          data = SAMPLE_TERMS;
        }

        setSections(data);

        // Auto-expand level 1 items if initialExpanded is "all"
        if (initialExpanded === "all") {
          const level1Ids = new Set(data.map((item) => item._id));
          setExpandedItems(level1Ids);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load data:", err);
        setLoading(false);
      }
    };

    loadData();
  }, [initialExpanded, dataJson]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Chevron icon as inline SVG
  const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transition: `transform ${animSpeed}ms ease`,
        transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path
        d="M7 8L10 11L13 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Render content based on type
  const renderContent = (section: TermsSection): React.ReactNode => {
    const contentType = section.contentType || "paragraph";

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginTop: "8px",
    };

    switch (contentType) {
      case "list":
        return (
          <div style={{ ...containerStyle, paddingLeft: "16px" }}>
            {section.content?.split("\n").map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "12px", marginTop: "2px" }}>•</span>
                <span style={{ fontSize: "12px", lineHeight: "1.5" }}>
                  {item.trim()}
                </span>
              </div>
            ))}
          </div>
        );

      case "section":
        return (
          <span style={{ fontSize: "12px", fontWeight: "600", marginTop: "8px" }}>
            {section.content}
          </span>
        );

      case "paragraph":
      default:
        return (
          <span style={{ fontSize: "12px", marginTop: "8px", lineHeight: "1.5" }}>
            {section.content}
          </span>
        );
    }
  };

  // Recursive accordion item renderer
  const renderAccordionItem = (section: TermsSection, depth: number = 0) => {
    const isExpanded = expandedItems.has(section._id);
    const hasChildren = section.children && section.children.length > 0;

    const indentationMap: { [key: number]: number } = {
      0: 0,
      1: 16,
      2: 32,
      3: 48,
      4: 64,
    };

    const indent = indentationMap[depth] || depth * 16;

    const headerStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      cursor: hasChildren ? "pointer" : "default",
      backgroundColor:
        depth === 0
          ? "rgba(0, 0, 0, 0.02)"
          : "transparent",
      borderBottom: depth === 0 ? "1px solid rgba(0, 0, 0, 0.08)" : "none",
      transition: "background-color 250ms ease",
      userSelect: "none",
    };

    return (
      <div
        key={section._id}
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: `${indent}px`,
        }}
      >
        {/* Header Button */}
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              toggleExpand(section._id);
            }
          }}
          style={headerStyle}
          onMouseEnter={(e) => {
            if (hasChildren) {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                depth === 0
                  ? "rgba(0, 0, 0, 0.04)"
                  : "rgba(0, 0, 0, 0.02)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              depth === 0
                ? "rgba(0, 0, 0, 0.02)"
                : "transparent";
          }}
          aria-expanded={isExpanded}
          aria-controls={`${section._id}-content`}
          aria-describedby={`${section._id}-title`}
        >
          {/* Chevron Icon */}
          {hasChildren && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#333",
              }}
            >
              <ChevronIcon rotated={isExpanded} />
            </div>
          )}

          {/* Title */}
          <span
            id={`${section._id}-title`}
            style={{
              flex: 1,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {section.title}
          </span>
        </button>

        {/* Content - with smooth expand/collapse animation */}
        {isExpanded && (
          <div
            id={`${section._id}-content`}
            style={{
              animation: `slideDown ${animSpeed}ms ease`,
              animationFillMode: "forward",
              overflow: "hidden",
            }}
          >
            {section.content && (
              <div style={{ padding: "0 16px" }}>
                {renderContent(section)}
              </div>
            )}

            {/* Render children recursively */}
            {hasChildren && (
              <div>
                {section.children!.map((child) =>
                  renderAccordionItem(child, depth + 1)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Inline styles for animations
  const styles = `
    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
      }
      to {
        opacity: 1;
        max-height: 9999px;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 1;
        max-height: 9999px;
      }
      to {
        opacity: 0;
        max-height: 0;
      }
    }
  `;

  // Wrapper styles
  const wrapperStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  };

  if (loading) {
    return (
      <div style={wrapperStyles}>
        <style>{styles}</style>
        <div style={{ padding: "20px" }}>
          <span style={{ fontSize: "12px" }}>Loading Terms of Use...</span>
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div style={wrapperStyles}>
        <style>{styles}</style>
        <div style={{ padding: "20px" }}>
          <span style={{ fontSize: "12px" }}>
            No Terms of Use data available.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyles}>
      <style>{styles}</style>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {sections.map((section) => renderAccordionItem(section, 0))}
      </div>
    </div>
  );
};

// Convert to web component
const termsOfUseAccordion = reactToWebComponent(
  TermsOfUseAccordion,
  React,
  ReactDOM,
  {
    props: {
      initialExpanded: "string",
      animationSpeed: "string",
      colorTheme: "string",
      dataJson: "string",
    },
  }
);

export default termsOfUseAccordion;
