/* Supabase removed; local DAL TODO */
export const supabase: any = new Proxy(
  {},
  {
    get() {
      throw new Error('Supabase client removed - TODO: implement local DAL');
    },
  }
);
export default supabase;
