let xlsxPromise;
let jsPDFPromise;
let html2canvasPromise;

export function loadXLSX() {
  if (!xlsxPromise) {
    xlsxPromise = import("xlsx");
  }
  return xlsxPromise;
}

export async function loadJsPDF() {
  if (!jsPDFPromise) {
    jsPDFPromise = Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]).then(([jsPDFModule]) => jsPDFModule.default);
  }
  return jsPDFPromise;
}

export async function loadHtml2Canvas() {
  if (!html2canvasPromise) {
    html2canvasPromise = import("html2canvas").then((mod) => mod.default);
  }
  return html2canvasPromise;
}
