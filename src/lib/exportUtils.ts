import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export const exportToDocx = async (content: string, title = "SIWES_Document") => {
  try {
    // Basic markdown to paragraphs conversion
    // A real implementation might use a markdown parser to Docx elements
    const lines = content.split("\n");
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: lines.map((line) => {
            const isHeading = line.startsWith("#");
            const isBold = line.includes("**");
            let text = line.replace(/#/g, "").replace(/\*\*/g, "").trim();

            return new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  bold: isHeading || isBold,
                  size: isHeading ? 32 : 24, // 16pt or 12pt
                }),
              ],
              spacing: { after: 200 },
            });
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
    return true;
  } catch (error) {
    console.error("Failed to export DOCX:", error);
    return false;
  }
};

export const exportToPdf = async (content: string, title = "SIWES_Document") => {
  try {
    // Dynamic import to avoid SSR issues with html2pdf.js
    const html2pdf = (await import("html2pdf.js")).default;
    
    // Create a temporary element to render the markdown
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">${content.replace(/\n/g, '<br/>')}</div>`;
    
    const opt = {
      margin:       1,
      filename:     `${title}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in' as const, format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(tempDiv).save();
    return true;
  } catch (error) {
    console.error("Failed to export PDF:", error);
    return false;
  }
};
