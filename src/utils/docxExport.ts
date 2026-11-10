/** Minimal standards-compliant WordprocessingML .docx export, no CDN or runtime dependency.
 * User data is escaped before insertion in XML; ZIP files are generated client-side.
 */
export interface DocumentField { label: string; value: unknown; section?: string }
const utf8 = (text: string): Uint8Array => new TextEncoder().encode(text);
const esc = (value: unknown) => String(value ?? '—').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char] || char);
const xmlText = (value: unknown): string => String(value ?? '—').split(/\r?\n/).map(line => `<w:r><w:t xml:space="preserve">${esc(line)}</w:t></w:r>`).join('<w:r><w:br/></w:r>');
const p = (text: unknown, style = 'Normal') => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${xmlText(text)}</w:p>`;
const row = (label: string, value: unknown) => `<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="2050" w:type="dxa"/><w:shd w:fill="F5F0E4"/></w:tcPr>${p(label, 'FieldLabel')}</w:tc><w:tc><w:tcPr><w:tcW w:w="6950" w:type="dxa"/></w:tcPr>${p(value, 'Normal')}</w:tc></w:tr>`;

function wordXml(title: string, fields: DocumentField[]): string {
  let section = '';
  const blocks: string[] = [p('RELIEFGO  /  OFFICIAL CAMPAIGN RECORD', 'Eyebrow'), p(title, 'Title'), p(`Generated ${new Date().toLocaleString('en-PH', {timeZone:'Asia/Manila'})} · Administrator use only`, 'Note')];
  for (const field of fields) {
    if (field.section && field.section !== section) {
      section = field.section;
      blocks.push(p(section, 'Heading1'));
    }
    blocks.push(`<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:bottom w:val="single" w:sz="4" w:color="DFE4D9"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="2050"/><w:gridCol w:w="6950"/></w:tblGrid>${row(field.label, field.value)}</w:tbl>`);
  }
  blocks.push(p('Supporting documents are available separately to authorized reviewers.', 'Note'));
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${blocks.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="1030" w:bottom="900" w:left="1030" w:header="430" w:footer="430"/></w:sectPr></w:body></w:document>`;
}
const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="20"/><w:color w:val="173729"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:styleId="Normal" w:default="1"><w:name w:val="Normal"/><w:pPr><w:spacing w:before="70" w:after="100" w:line="275" w:lineRule="auto"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:spacing w:after="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:sz w:val="42"/><w:color w:val="173729"/><w:b/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:spacing w:before="240" w:after="125"/><w:keepNext/></w:pPr><w:rPr><w:sz w:val="26"/><w:color w:val="173729"/><w:b/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="FieldLabel"><w:name w:val="Field Label"/><w:rPr><w:sz w:val="18"/><w:b/><w:color w:val="995338"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Note"><w:name w:val="Note"/><w:rPr><w:sz w:val="17"/><w:color w:val="697568"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Eyebrow"><w:name w:val="Eyebrow"/><w:rPr><w:sz w:val="18"/><w:b/><w:color w:val="BE563B"/></w:rPr></w:style></w:styles>`;
const files = (document: string): Record<string, string> => ({
  '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
  '_rels/.rels': `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  'word/document.xml': document,
  'word/styles.xml': styles,
});
const table = (() => { const t: number[] = []; for (let n = 0; n < 256; n++) { let c = n; for (let b = 0; b < 8; b++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t.push(c >>> 0); } return t; })();
function crc(bytes: Uint8Array): number { let result = 0xFFFFFFFF; for (const b of bytes) result = table[(result ^ b) & 255] ^ (result >>> 8); return (result ^ 0xFFFFFFFF) >>> 0; }
function zipEntries(entries: Record<string, string>): Blob {
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  const encoder = new TextEncoder();
  let offset = 0;
  const little = (view: DataView, start: number, value: number, bytes = 4) => bytes === 2 ? view.setUint16(start, value, true) : view.setUint32(start, value >>> 0, true);
  for (const [filename, xml] of Object.entries(entries)) {
    const name = encoder.encode(filename);
    const body = utf8(xml);
    const checksum = crc(body);
    const local = new Uint8Array(30 + name.length + body.length);
    const lv = new DataView(local.buffer);
    little(lv, 0, 0x04034b50); little(lv, 4, 20, 2); little(lv, 6, 0x0800, 2);
    little(lv, 8, 0, 2); little(lv, 14, checksum); little(lv, 18, body.length); little(lv, 22, body.length); little(lv, 26, name.length, 2);
    local.set(name, 30); local.set(body, 30 + name.length); locals.push(local);
    const cd = new Uint8Array(46 + name.length); const cv = new DataView(cd.buffer);
    little(cv, 0, 0x02014b50); little(cv, 4, 20, 2); little(cv, 6, 20, 2); little(cv, 8, 0x0800, 2);
    little(cv, 16, checksum); little(cv, 20, body.length); little(cv, 24, body.length); little(cv, 28, name.length, 2); little(cv, 42, offset);
    cd.set(name, 46); central.push(cd); offset += local.length;
  }
  const centralLength = central.reduce((sum, part) => sum + part.length, 0);
  const footer = new Uint8Array(22); const fv = new DataView(footer.buffer);
  little(fv, 0, 0x06054b50); little(fv, 8, central.length, 2); little(fv, 10, central.length, 2); little(fv, 12, centralLength); little(fv, 16, offset);
  const parts = [...locals, ...central, footer];
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of parts) { result.set(part, cursor); cursor += part.length; }
  return new Blob([result.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
export function downloadWordDetails(title: string, fields: DocumentField[], id: string): void {
  const file = zipEntries(files(wordXml(title, fields)));
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ReliefGO-${id.replace(/[^a-z0-9-]/gi, '') || 'record'}.docx`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
