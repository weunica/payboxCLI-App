import React, { type FC, useState, useEffect, useCallback } from "react";
import { widget } from "@wix/editor";
import {
  SidePanel,
  WixDesignSystemProvider,
  FormField,
  Box,
  Text,
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";

const Panel: FC = () => {
  const [initialExpanded, setInitialExpanded] = useState<string>("all");
  const [animationSpeed, setAnimationSpeed] = useState<string>("300");

  // Load initial values (kebab-case prop names)
  useEffect(() => {
    Promise.all([
      widget.getProp("initial-expanded"),
      widget.getProp("animation-speed"),
    ])
      .then(([expandedVal, speedVal]) => {
        setInitialExpanded(expandedVal || "all");
        setAnimationSpeed(speedVal || "300");
      })
      .catch((error) =>
        console.error("Failed to fetch widget properties:", error)
      );
  }, []);

  const handleExpandedChange = useCallback(
    (value: string) => {
      setInitialExpanded(value);
      widget.setProp("initial-expanded", value);
    },
    []
  );

  const handleSpeedChange = useCallback((value: number) => {
    const speedStr = value.toString();
    setAnimationSpeed(speedStr);
    widget.setProp("animation-speed", speedStr);
  }, []);

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <SidePanel width="300" height="100vh">
        <SidePanel.Header title="Terms Accordion Settings" />
        <SidePanel.Content noPadding stretchVertically>
          <Box direction="vertical" gap="24px" padding="24px">
            {/* Initial Expansion State */}
            <SidePanel.Field>
              <FormField label="Initial Expansion State">
                <select 
                  value={initialExpanded}
                  onChange={(e) => handleExpandedChange(e.target.value)}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="all">All sections expanded</option>
                  <option value="first-level">First level only</option>
                  <option value="none">All sections collapsed</option>
                </select>
              </FormField>
            </SidePanel.Field>

            {/* Animation Speed */}
            <SidePanel.Field>
              <FormField label="Animation Speed (ms)">
                <input
                  type="number"
                  value={animationSpeed}
                  onChange={(e) => {
                    const val = e.target.value;
                    const numVal = parseInt(val);
                    if (numVal >= 100 && numVal <= 1000) {
                      handleSpeedChange(numVal);
                    }
                  }}
                  min="100"
                  max="1000"
                  step="50"
                  style={{ width: "100%", padding: "8px" }}
                />
              </FormField>
            </SidePanel.Field>

            {/* Info text */}
            <Box direction="vertical" gap="8px" padding={12} style={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              borderRadius: "4px",
            }}>
              <Text size="small" color="secondary">
                This widget displays a hierarchical accordion from the <strong>TermsOfUse</strong> collection. Items are organized by parent-child relationships.
              </Text>
            </Box>
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
