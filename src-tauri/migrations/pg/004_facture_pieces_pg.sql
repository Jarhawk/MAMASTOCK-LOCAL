CREATE TABLE IF NOT EXISTS facture_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id BIGINT NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  ext TEXT,
  mime TEXT,
  size BIGINT,
  stored_path TEXT NOT NULL,
  original_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facture_pieces_facture_id ON facture_pieces(facture_id);

CREATE OR REPLACE VIEW v_facture_piece_count AS
SELECT f.id AS facture_id, COUNT(p.id) AS piece_count
FROM factures f
LEFT JOIN facture_pieces p ON p.facture_id = f.id
GROUP BY f.id;
