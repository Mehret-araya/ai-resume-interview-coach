import PDFDocument from "pdfkit";

const generateResumePdf = (content, res) => {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Resume content is empty");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="resume.pdf"'
  );

  doc.pipe(res);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(content.trim(), {
      align: "left",
      lineGap: 5,
    });

  doc.end();
};

export default generateResumePdf;