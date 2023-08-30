import {AxiosError} from "axios";
import {ToastMessageOptions} from "primevue/toast";

export const successToast = (msg?: string): ToastMessageOptions => {
  return {
    life: 5000,
    summary: "Success",
    detail: msg,
    severity: 'success',
  }
}

export const fromAxiosError = (error: AxiosError): ToastMessageOptions => {
  return {
    life: 5000,
    summary: "Error while processing the request",
    detail: (error?.response?.data as { message: string })?.message ?? error?.code ?? "Unknown error",
    severity: 'error',
  }
}

export const fromErrorMessage = (error: string): ToastMessageOptions => {
  return {
    life: 5000,
    summary: "Error",
    detail: error,
    severity: 'error',
  }
}

export const notImplemented = (msg: string): ToastMessageOptions => {
  return {
    severity: "info",
    summary: "Not implemented",
    detail: msg,
    life: 3000
  }
}