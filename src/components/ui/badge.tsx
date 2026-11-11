import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-[var(--gui-space-xxs)] overflow-hidden rounded-none border border-[var(--frame)] px-[7px] py-[5px] font-[family-name:var(--gui-font-label)] text-[11px] leading-none font-normal tracking-[1px] uppercase whitespace-nowrap outline-none transition-[background-color,color] [transition-duration:var(--gui-motion-small)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gui-focus)] aria-invalid:outline-2 aria-invalid:outline-[var(--gui-error)] [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        /* .badge.warn: state in progress, ink outline, no colour. */
        default: "border-[var(--ink)] bg-transparent text-[var(--ink)]",
        /* .badge: neutral state. */
        secondary: "bg-transparent text-[var(--ink)]",
        destructive: "border-[var(--alert)] bg-transparent text-[var(--alert)]",
        outline: "bg-transparent text-[var(--ink)]",
        /* .badge.off: closed or unavailable. */
        ghost: "border-[var(--rule)] text-[var(--mute)]",
        link: "text-[var(--gui-link)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
