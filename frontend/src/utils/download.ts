// Turning a blob response into a file the browser saves.
//
// Kept out of the components that use it because getting this wrong leaks
// memory in a way nothing reports: an object URL pins its blob until it is
// explicitly revoked, so a page that lets someone download ten invoices holds
// ten PDFs in memory for the rest of the session.

/**
 * Prompt the browser to save a blob under `filename`.
 *
 * Only meaningful in the browser; calling it during a server render is a no-op
 * rather than a crash, since `document` does not exist there.
 */
export const saveBlobAsFile = (blob: Blob, filename: string): void => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  // Firefox only follows a programmatic click on an element that is in the
  // document, so the link is attached and removed rather than clicked detached.
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};

/**
 * Read the filename out of a `Content-Disposition` header.
 *
 * Returns null when the header is missing or unparseable, which is the normal
 * case cross-origin unless the server exposes the header through CORS - so
 * callers must always have a fallback name ready.
 */
export const filenameFromContentDisposition = (
  header: string | undefined | null
): string | null => {
  if (!header) return null;

  // RFC 5987 form first: filename*=UTF-8''name.pdf carries the encoded name and
  // takes precedence over the plain parameter when both are present.
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      // Malformed percent-encoding: fall through to the plain parameter.
    }
  }

  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain?.[1]?.trim() || null;
};
