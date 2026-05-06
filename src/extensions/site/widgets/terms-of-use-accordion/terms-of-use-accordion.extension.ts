import { extensions } from "@wix/astro/builders";

export default extensions.customElement({
  id: "7c9e1f3a-5d2b-4bfa-8eac-3f1c6b2a9d4e",
  name: "Terms of Use Accordion",
  tagName: "terms-of-use-accordion",
  element: "./extensions/site/widgets/terms-of-use-accordion/terms-of-use-accordion.tsx",
  settings: "./extensions/site/widgets/terms-of-use-accordion/terms-of-use-accordion.panel.tsx",
  installation: {
    autoAdd: true,
  },
  width: {
    defaultWidth: 600,
    allowStretch: true,
  },
  height: {
    defaultHeight: 400,
  },
});
