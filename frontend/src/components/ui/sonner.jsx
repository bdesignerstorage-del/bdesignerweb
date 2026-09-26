import { Toaster as Sonner, toast } from "sonner"
import { useTheme } from "@/context/ThemeContext"

/**
 * Toaster — wired to the BDesigner ThemeContext (single source of truth) so
 * toasts follow the site theme. Colours are pulled from the design-system
 * tokens in index.css (see .bd-theme-toast) so Light mode is white surface +
 * near-black text and Dark mode is the charcoal card surface — matching
 * docs/design.md §2 theme tokens.
 */
const Toaster = ({ ...props }) => {
  const { theme = "dark" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group bd-theme-toast"
      toastOptions={{
        classNames: {
          toast:
            "group toast bd-theme-toast__toast",
          description: "bd-theme-toast__desc",
          actionButton: "bd-theme-toast__action",
          cancelButton: "bd-theme-toast__cancel",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
