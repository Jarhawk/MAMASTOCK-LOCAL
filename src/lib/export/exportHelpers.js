// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import JSPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { dump } from 'js-yaml';
import { getExportDir } from '@/lib/db';
import { isTauri } from '@/lib/db/sql';

async function resolveExportPath(filename) {
  const dir = await getExportDir();
  if (!isTauri) return filename;
  const fs = await import('@tauri-apps/plugin-fs');
  const { join } = await import('@tauri-apps/api/path');
  await fs.mkdir(dir, { recursive: true });
  return await join(dir, filename);
}

async function saveBlob(blob, filename, useDialog = true) {
    if (isTauri) {
    const fs = await import('@tauri-apps/plugin-fs');
    const { save } = await import('@tauri-apps/plugin-dialog');
    const defaultPath = await resolveExportPath(filename);
    const path = useDialog ? (await save({ defaultPath })) || defaultPath : defaultPath;
    const buf = await blob.arrayBuffer();
    await fs.writeFile(path, new Uint8Array(buf));
  } else {
    console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    saveAs(blob, filename);
  }
}

export async function exportToPDF(data = [], config = {}) {
  const {
    filename = 'export.pdf',
    columns = [],
    orientation = 'portrait',
    useDialog = true,
  } = config;
  const orient = ['portrait', 'landscape'].includes(String(orientation).toLowerCase())
    ? String(orientation).toLowerCase()
    : 'portrait';
  const doc = new JSPDF({ orientation: orient });
  if (!Array.isArray(data)) data = [data];
  const headers = columns.length
    ? [columns.map((c) => c.label)]
    : [Object.keys(data[0] || {})];
  const rows = data.map((item) =>
    columns.length
      ? columns.map((c) => item[c.key])
      : Object.values(item)
  );
  doc.autoTable({ head: headers, body: rows, styles: { fontSize: 9 } });
  const blob = doc.output('blob');
  await saveBlob(blob, filename, useDialog);
}

export async function exportToExcel(data = [], config = {}) {
  const {
    filename = 'export.xlsx',
    sheet = 'Sheet1',
    columns = [],
    useDialog = true,
  } = config;
  if (!Array.isArray(data)) data = [data];
  const arr = data.map((item) => {
    if (columns.length) {
      const obj = {};
      columns.forEach((c) => {
        obj[c.label] = item[c.key];
      });
      return obj;
    }
    return item;
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(arr);
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  await saveBlob(new Blob([buf]), filename, useDialog);
}

export async function exportToCSV(data = [], config = {}) {
  const {
    filename = 'export.csv',
    columns = [],
    delimiter = ',',
    quoteValues = false,
    useDialog = true,
  } = config;
  const delim = typeof delimiter === 'string' && delimiter.length ? delimiter : ',';
  if (!Array.isArray(data)) data = [data];
  const quote = (v) => (quoteValues ? `"${v}"` : v);
  const header = columns.length
    ? columns.map((c) => quote(c.label)).join(delim)
    : Object.keys(data[0] || {}).map(quote).join(delim);
  const rows = data.map((item) =>
    columns.length
      ? columns.map((c) => quote(item[c.key])).join(delim)
      : Object.values(item).map(quote).join(delim)
  );
  const csv = [header, ...rows].join('\n');
  await saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename, useDialog);
}

export function exportToTSV(data = [], config = {}) {
  const { filename = 'export.tsv', columns = [] } = config;
  return exportToCSV(data, {
    filename,
    columns,
    delimiter: '\t',
    quoteValues: false,
  });
}

export function exportToJSON(data = [], config = {}) {
  const { filename = 'export.json', pretty = true } = config;
  if (!Array.isArray(data)) data = [data];
  const json = JSON.stringify({ data }, null, pretty ? 2 : 0);
  saveAs(new Blob([json], { type: 'application/json;charset=utf-8;' }), filename);
}

export function exportToXML(data = [], config = {}) {
  const {
    filename = 'export.xml',
    root = 'items',
    row = 'item',
  } = config;
  if (!Array.isArray(data)) data = [data];
  const rows = data.map((item) => {
    const cells = Object.entries(item)
      .map(([k, v]) => `<${k}>${v}</${k}>`)
      .join('');
    return `<${row}>${cells}</${row}>`;
  });
  const xml = `<${root}>${rows.join('')}</${root}>`;
  saveAs(new Blob([xml], { type: 'application/xml;charset=utf-8;' }), filename);
}

export function exportToHTML(data = [], config = {}) {
  const { filename = 'export.html', columns = [] } = config;
  if (!Array.isArray(data)) data = [data];
  const labels = columns.length ? columns.map((c) => c.label) : Object.keys(data[0] || {});
  const header = labels.map((l) => `<th>${l}</th>`).join('');
  const rows = data.map((item) => {
    const cells = columns.length
      ? columns.map((c) => `<td>${item[c.key]}</td>`)
      : Object.values(item).map((v) => `<td>${v}</td>`);
    return `<tr>${cells.join('')}</tr>`;
  });
  const html = `<table><thead><tr>${header}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  saveAs(new Blob([html], { type: 'text/html;charset=utf-8;' }), filename);
}

export function exportToMarkdown(data = [], config = {}) {
  const { filename = 'export.md', columns = [] } = config;
  if (!Array.isArray(data)) data = [data];
  const labels = columns.length ? columns.map((c) => c.label) : Object.keys(data[0] || {});
  const header = `|${labels.join('|')}|`;
  const divider = `|${labels.map(() => '---').join('|')}|`;
  const rows = data.map((item) => {
    const cells = columns.length ? columns.map((c) => item[c.key]) : labels.map((k) => item[k]);
    return `|${cells.join('|')}|`;
  });
  const md = [header, divider, ...rows].join('\n');
  saveAs(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), filename);
}

export function exportToYAML(data = [], config = {}) {
  const { filename = 'export.yaml' } = config;
  if (!Array.isArray(data)) data = [data];
  const yml = dump({ data });
  saveAs(new Blob([yml], { type: 'text/yaml;charset=utf-8;' }), filename);
}

export function exportToTXT(data = [], config = {}) {
  const { filename = 'export.txt', columns = [] } = config;
  if (!Array.isArray(data)) data = [data];
  const lines = data.map((item) => {
    const obj = columns.length
      ? columns.reduce((acc, c) => ({ ...acc, [c.label]: item[c.key] }), {})
      : item;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  });
  const txt = lines.join('\n\n');
  saveAs(new Blob([txt], { type: 'text/plain;charset=utf-8;' }), filename);
}

export function exportToClipboard(data = [], config = {}) {
  const { columns = [] } = config;
  if (!Array.isArray(data)) data = [data];
  const lines = data.map((item) => {
    const obj = columns.length
      ? columns.reduce((acc, c) => ({ ...acc, [c.label]: item[c.key] }), {})
      : item;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  });
  navigator.clipboard.writeText(lines.join('\n\n'));
}
export function printView(content) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(content);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}
