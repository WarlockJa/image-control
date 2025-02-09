import { Loader2Icon } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoaderButton({
  children,
  isLoading,
  isDisabled,
  showChildren,
  className,
  ...props
}: ButtonProps & {
  isLoading?: boolean;
  isDisabled: boolean;
  showChildren?: boolean;
}) {
  return (
    <Button
      disabled={isDisabled}
      type="submit"
      {...props}
      className={cn("flex justify-center gap-2", className)}
    >
      {isLoading && <Loader2Icon size={40} className="animate-spin" />}
      {showChildren ? children : !isLoading && children}
    </Button>
  );
}
