import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const parseResume = async (filePath, mimeType) => {
  const fileBuffer = fs.readFileSync(filePath);

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({
      data: fileBuffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text.trim();
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: fileBuffer,
    });

    return result.value.trim();
  }

  throw new Error("Unsupported resume file type");
};

export default parseResume;