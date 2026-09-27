// Smooth-scroll to a Homepage section id, accounting for the 64px sticky
// navbar. Navigates home first when the user is on another route, then waits
// for the target to mount before scrolling. Updates the URL hash cleanly.
const NAV_OFFSET = 76; // 64px navbar + a little breathing room

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
  return true;
}

// Navigate (if needed) to the homepage and smooth-scroll to `id`.
// `navigate` is the react-router navigate fn; `pathname` is the current path.
export function goToSection({ id, navigate, pathname }) {
  const doScroll = () => {
    let tries = 0;
    const t = setInterval(() => {
      if (scrollToId(id) || ++tries > 30) {
        clearInterval(t);
        try {
          const url = new URL(window.location.href);
          url.hash = id;
          window.history.replaceState({}, "", url.toString());
        } catch { /* ignore */ }
      }
    }, 90);
  };
  if (pathname !== "/") {
    navigate("/");
    setTimeout(doScroll, 120);
  } else {
    doScroll();
  }
}

// Scroll the window to the very top (used by the Home nav item when already
// on the homepage).
export function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
