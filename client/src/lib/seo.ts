import { useEffect } from 'react';

const SUFFIX = 'Jasmine Cosmetics';

// Sets the document <title> for the current page and restores nothing (SPA).
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} | Lip Gloss, Brows & Liquid Blush`;
  }, [title]);
}
