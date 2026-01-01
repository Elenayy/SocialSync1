
// The 'process' variable is already declared in the global scope by environmental types (e.g., @types/node).
// We only need to augment the NodeJS.ProcessEnv interface to include our specific environment variables.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
