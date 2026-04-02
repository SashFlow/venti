"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { Slot, Slottable } from "@radix-ui/react-slot"

function Collapsible({
  asChild = false,
  children,
  ...props
}: CollapsiblePrimitive.Root.Props & { asChild?: boolean }) {
  if (asChild) {
    return (
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        render={<Slot />}
        {...props}
      >
        <Slottable>{children}</Slottable>
      </CollapsiblePrimitive.Root>
    )
  }

  return (
    <CollapsiblePrimitive.Root data-slot="collapsible" {...props}>
      {children}
    </CollapsiblePrimitive.Root>
  )
}

function CollapsibleTrigger({
  asChild = false,
  children,
  ...props
}: CollapsiblePrimitive.Trigger.Props & { asChild?: boolean }) {
  if (asChild) {
    return (
      <CollapsiblePrimitive.Trigger
        data-slot="collapsible-trigger"
        render={<Slot />}
        {...props}
      >
        <Slottable>{children}</Slottable>
      </CollapsiblePrimitive.Trigger>
    )
  }

  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props}>
      {children}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
