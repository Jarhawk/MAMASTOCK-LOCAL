import { menuGroupes_list, menuGroupes_addLigne } from "@/local/menuGroupes";import { isTauri } from "@/lib/runtime/isTauri";

export default function useMenuGroupe() {
  async function fetchMenusGroupes({ q } = {}) {
    return await menuGroupes_list({ q });
  }

  async function addLigne(menuGroupeId, ligne) {
    await menuGroupes_addLigne(menuGroupeId, ligne);
  }

  return { fetchMenusGroupes, addLigne };
}