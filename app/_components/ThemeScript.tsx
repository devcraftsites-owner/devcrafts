export function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = window.localStorage.getItem("theme-mode");
        var theme = stored === "light" || stored === "dark"
          ? stored
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch (error) {
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
      }
    }());
  `

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
