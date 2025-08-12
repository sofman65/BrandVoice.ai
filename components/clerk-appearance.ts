export const brandVoiceClerkAppearance = {
  layout: {
    logoPlacement: "none", // avoid duplicate logo (we already show one in AuthWrapper)
    socialButtonsPlacement: "top",
  },
  variables: {
    colorPrimary: "#8b5cf6",
    colorText: "#ffffff",
    colorTextOnPrimaryBackground: "#ffffff",
    colorBackground: "transparent",
    colorInputBackground: "rgba(255, 255, 255, 0.08)",
    colorInputText: "#ffffff",
    colorInputBorder: "rgba(255,255,255,0.2)",
    borderRadius: "12px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    spacingUnit: "8px",
  },
  elements: {
    card: "bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl",
    headerTitle: "text-white",
    headerSubtitle: "text-gray-300",
    formFieldLabel: "text-white font-medium",
    formFieldInput:
      "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-11",
    formButtonPrimary:
      "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-11",
    footerActionLink: "text-purple-300 hover:text-purple-200",
    dividerLine: "bg-white/15",
    dividerText: "text-gray-400",
    socialButtonsBlockButton:
      "bg-white/10 border-white/20 text-white hover:bg-white/20 h-11",
    socialButtonsBlockButtonText: "text-white",
    formFieldInputShowPasswordButton: "text-gray-300 hover:text-white",
  },
} as const;
