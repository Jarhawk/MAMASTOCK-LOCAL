declare module "sql.js" {
  type SqlJsStatic = {
    Database: new () => {
      close(): void;
      exec(sql: string): unknown;
      prepare(sql: string): {
        bind(params?: unknown[]): void;
        get(): unknown[];
        getAsObject(): Record<string, unknown>;
        getColumnNames(): string[];
        free(): void;
        step(): boolean;
      };
      run(sql: string, params?: unknown[]): void;
    };
  };

  export default function initSqlJs(config?: unknown): Promise<SqlJsStatic>;
}
