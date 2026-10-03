import fs from "fs";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const getFileBuffer = async (filePath) => {
  if (
    typeof filePath === "string" &&
    (filePath.startsWith("http://") ||
      filePath.startsWith("https://"))
  ) {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(
        `Unable to download uploaded resume: ${response.status}`
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  return fs.readFileSync(filePath);
};

const parseResume = async (filePath, mimeType) => {
  const fileBuffer = await getFileBuffer(filePath);

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