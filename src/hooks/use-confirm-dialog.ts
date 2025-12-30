import { useState } from "react";
import { toast } from "./use-toast";

export interface ConfirmOptions {
  title: string;
  description?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  itemName?: string;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!options) return;
    try {
      setIsLoading(true);
      await options.onConfirm();
      toast({ title: "Deleted successfully" });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    isLoading,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
