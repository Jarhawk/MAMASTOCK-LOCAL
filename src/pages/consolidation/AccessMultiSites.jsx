// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";

import TableContainer from "@/components/ui/TableContainer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { readConfig } from "@/appFs";

export default function AccessMultiSites() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    readConfig().then((cfg) => {
      const list = (cfg && cfg.user_mama_access) || [];
      setRows(list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Accès multi-sites</h1>
      {loading ?
      <LoadingSpinner message="Chargement..." /> :

      <TableContainer>
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Site</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
            <tr key={r.id}>
                  <td>{r.user_id}</td>
                  <td>{r.mama_id}</td>
                  <td>{r.role}</td>
                </tr>
            )}
            </tbody>
          </table>
        </TableContainer>
      }
    </div>);

}