// Resolve internal link accessible names at runtime.
// Finds all anchors with `data-internal-link` and sets `aria-label` to the visible
// heading text of the target element (falling back to the anchor text).

export function resolveInternalLinkLabels(root = document) {
  try {
    const anchors = Array.from(root.querySelectorAll('a[data-internal-link]'));
    anchors.forEach((a) => {
      try {
        const anchorId = a.getAttribute('data-internal-link');
        if (!anchorId) return;
        // Find target element by id (the heading has id like subsection-4-2-title or subsection-4-2)
        const possibleIds = [`${anchorId}-title`, anchorId, `${anchorId}-content`];
        let target = null;
        for (const id of possibleIds) {
          const el = document.getElementById(id);
          if (el) {
            target = el;
            break;
          }
        }

        // Extract readable text from target, prefer visible heading text
        let labelText = '';
        if (target) {
          // prefer textContent of the target but strip surrounding numbers/formatting
          labelText = target.textContent ? target.textContent.trim() : '';
          // If heading contains numbering like "4.2. שם הכותרת", remove leading numbering
          labelText = labelText.replace(/^\s*\d+[\.)\-\s]*/u, '');
          // remove leading numbering like "4.2 "
          labelText = labelText.replace(/^\s*\d+(?:[\.]\d+)*\s*/u, '');
        }

        // If still empty, use anchor visible text
        if (!labelText) {
          labelText = a.textContent ? a.textContent.trim() : '';
        }

        if (labelText) {
          // Set aria-label so screen readers announce meaningful label
          a.setAttribute('aria-label', labelText);
          // Optionally set aria-description for extra context (not overriding aria-label)
          // If you want longer descriptive text, you can set aria-description similarly.
        }
      } catch (err) {
        // ignore individual anchor errors
      }
    });
  } catch (err) {
    // ignore
  }
}
