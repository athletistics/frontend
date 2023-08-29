import {AxiosError} from "axios";
import {acceptHMRUpdate, defineStore} from 'pinia'

import Toast from "@/types/Toast";

interface State {
    toasts: Toast[]
}

export const useToastStore = defineStore('toast', {
    state: (): State => ({
        toasts: [] as Toast[]
    }),
    getters: {

    },
    actions: {
        addToast(toast: Toast) {
            this.toasts.push(toast);
        },
        addSuccessToast(){
            this.addToast({
                title: "Success",
                color: "bg-primary"
            })
        },
        addErrorToast(title: string) {
            this.addToast({
                title,
                color: "bg-red-600"
            })
        },
        addToastFromAxiosError(error: AxiosError){
            this.addToast({
                code: (error?.response?.data as {error: number})?.error ?? error?.status,
                title: "Error while processing the request",
                message: (error?.response?.data as {message: string})?.message ?? error?.code ?? error ?? "Unknown error",
                color: "bg-red-600",
            })
        },
        clearToast(title: string) {
            const index = this.toasts.findIndex((toast) => toast.title === title); // find toast
            this.toasts.splice(index, 1); // remove toast from array
        }
    }
})

if(import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot))
}