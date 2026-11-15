import { Font } from "@react-pdf/renderer";

export const pdfFontFamily = ["InstrumentSans", "Helvetica"];

const fontFiles = [
  { file: "InstrumentSans-Regular.ttf", fontWeight: 400 },
  { file: "InstrumentSans-SemiBold.ttf", fontWeight: 600 },
  { file: "InstrumentSans-Bold.ttf", fontWeight: 700 },
];

export function registerPdfFonts(fontBaseUrl: string): void {
  Font.register({
    family: "InstrumentSans",
    fonts: fontFiles.map(({ file, fontWeight }) => ({ src: `${fontBaseUrl}/${file}`, fontWeight })),
  });
  Font.registerHyphenationCallback((word) => [word]);
}
