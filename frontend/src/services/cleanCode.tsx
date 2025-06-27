export default function cleanCodeFences(htmlString: string): string {
    if (typeof htmlString !== 'string') return '';
    return htmlString
        .replace(/^\s*```(?:html)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
  }