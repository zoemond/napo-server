declare namespace NodeJS {
  interface ProcessEnv {
    readonly PORT: number;
    readonly CLIENT_DIR: string;
  }
}
