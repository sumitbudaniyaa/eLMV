import { api } from "@/lib/api";

/**
 * Downloads the official signed verification PDF directly in-page
 * using a blob stream without opening an external blank browser tab.
 */
export async function downloadCertificatePdf(certificateNumber: string): Promise<void> {
  if (!certificateNumber) return;

  try {
    const response = await api.get(
      `/verification/pdf/${encodeURIComponent(certificateNumber)}`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `Certificate-${certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 200);
  } catch (error) {
    console.error("Failed to download statutory certificate PDF:", error);
    throw error;
  }
}

/**
 * Prints a certificate DOM node cleanly in-page using a hidden iframe
 * so that background portal UI and navigation are unaffected and no
 * popup windows or new tabs are opened.
 */
export function printCertificateElement(target: string | HTMLElement): void {
  const node = typeof target === "string" ? document.getElementById(target) : target;
  if (!node) {
    console.warn("Print target not found:", target);
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  // Collect all current stylesheets and fonts
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((el) => el.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Statutory Certificate of Verification</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 12px;
            background: #ffffff !important;
            color: #18181b !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${node.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Trigger print after iframe renders styles
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1500);
  }, 350);
}
