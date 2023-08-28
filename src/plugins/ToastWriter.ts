import {AxiosError} from "axios";

export const fromAxiosError = (error: AxiosError): { severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: any, life: number } => {
  return {
    life: 5000,
    summary: "Error while processing the request",
    detail: (error?.response?.data as {message: string})?.message ?? error?.code ?? "Unknown error",
    severity: 'error',
  }
}