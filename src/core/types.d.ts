import { ServerResponse } from "node:http";

declare module 'http' {
  interface ServerResponse {
    json: (data: any) => void;
    status: (code: number) => ServerResponse;
  }
}