import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-0 font-medium whitespace-nowrap outline-none select-none transition-[background-color,color,opacity] [transition-duration:var(--dur-short)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gui-focus)] disabled:pointer-events-none disabled:bg-[var(--chip)] disabled:text-[var(--mute)] disabled:shadow-[inset_0_0_0_1px_var(--frame)] disabled:opacity-100 aria-invalid:outline-2 aria-invalid:outline-[var(--gui-error)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Instrument .cta2: light frame with an arrow cell. Most buttons on a screen use this. */
        default:
          "btn-cta2 bg-[var(--surface)] text-[var(--ink)] [--control-hover-bg:#ffffff] shadow-[inset_0_0_0_1px_var(--ink)]",
        /* Instrument .cta: the one main action of a screen. Orange background, dark text (5.5:1). */
        action:
          "btn-cta bg-[var(--action)] text-[var(--ink)] [--control-hover-bg:var(--action-hover)] shadow-[inset_0_0_0_1px_var(--ink)] active:bg-[var(--action-press)]",
        outline:
          "btn-outline bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--frame)] text-[var(--ink)] [--control-hover-bg:#ffffff] aria-expanded:bg-[var(--chip)]",
        secondary:
          "bg-[var(--gui-surface-muted)] text-[var(--gui-text)] [--control-hover-bg:var(--gui-neutral-4)] aria-expanded:bg-[var(--gui-neutral-4-transparent)]",
        ghost: "bg-transparent text-[var(--ink)] [--control-hover-bg:var(--chip)]",
        /* Instrument .tx: destructive actions are underlined text and always confirmed. */
        destructive:
          "bg-transparent px-0 text-[var(--alert)] underline underline-offset-[3px] [--control-hover-bg:transparent] focus-visible:outline-[var(--gui-focus)]",
        link: "bg-transparent px-0 text-[var(--ink)] underline underline-offset-[3px] [--control-hover-bg:transparent]",
      },
      size: {
        default:
          "min-h-12 gap-[var(--gui-space-xs)] px-[var(--gui-space-l)] py-[var(--gui-space-s)] text-[length:var(--gui-text-s)] leading-[var(--gui-leading-s)] tracking-[var(--gui-tracking-l)]",
        xs: "min-h-8 gap-[var(--gui-space-xxs)] px-[var(--gui-space-xs)] py-[var(--gui-space-xxs)] text-[length:var(--gui-text-xs)] leading-[var(--gui-leading-xs)] tracking-[var(--gui-tracking-l)] [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-10 gap-[var(--gui-space-xxs)] px-[var(--gui-space-s)] py-[var(--gui-space-xs)] text-[length:var(--gui-text-xs)] leading-[var(--gui-leading-xs)] tracking-[var(--gui-tracking-l)] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-14 gap-[var(--gui-space-xs)] px-[var(--gui-space-xl)] py-[var(--gui-space-s)] text-[length:var(--gui-text-m)] leading-[var(--gui-leading-m)]",
        icon: "btn-icon size-12 p-0",
        "icon-xs": "btn-icon size-8 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "btn-icon size-10 p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "btn-icon size-14 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
