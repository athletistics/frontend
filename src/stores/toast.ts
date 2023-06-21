import {acceptHMRUpdate, defineStore} from 'pinia'
import Toast from "../types/Toast.ts";
import {AxiosError} from "axios";

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
                title: "success",
                color: "bg-primary"
            })
        },
        addToastFromAxiosError(error: AxiosError){
            this.addToast({
                code: (error.response?.data as any).error ?? error.status,
                title: "Error while processing the request",
                message: (error.response?.data as any).message ?? error.code,
                color: "bg-error",
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