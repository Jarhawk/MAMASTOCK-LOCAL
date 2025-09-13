-- Pièces jointes de facture (fichiers copiés dans AppData)
CREATE TABLE IF NOT EXISTS facture_pieces (
  id            TEXT PRIMARY KEY,
  facture_id    TEXT NOT NULL,
  filename      TEXT NOT NULL,
  ext           TEXT,
  mime          TEXT,
  size          INTEGER,
  stored_path   TEXT NOT NULL, -- chemin absolu AppData où le fichier est copié
  original_path TEXT,          -- chemin d’origine choisi par l’utilisateur
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_facture_pieces_facture_id ON facture_pieces(facture_id);

-- Vue simple: nombre de pièces par facture
CREATE VIEW IF NOT EXISTS v_facture_piece_count AS
SELECT f.id AS facture_id, COUNT(p.id) AS piece_count
FROM factures f
LEFT JOIN facture_pieces p ON p.facture_id = f.id
GROUP BY f.id;
