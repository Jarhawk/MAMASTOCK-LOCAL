import { parseProduitsFile, insertProduits, validateProduitRow } from "./importExcelProduits";
import { exportExcelProduits, downloadProduitsTemplate } from "./exportExcelProduits";import { isTauri } from "@/lib/tauriEnv";

export {
  parseProduitsFile,
  insertProduits,
  validateProduitRow,
  exportExcelProduits,
  downloadProduitsTemplate };