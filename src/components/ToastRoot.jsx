import { Toaster } from 'sonner';import { isTauri } from "@/lib/tauriEnv";

export default function ToastRoot() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      visibleToasts={5}
      toastOptions={{
        duration: 3500
      }} />);


}