"use client";

import React from "react";

export default function ExhibitTabsHelper() {
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const sentinels = Array.from(
      document.querySelectorAll<HTMLElement>("[data-exhibit-tab-sentinel]"),
    );
    if (!sentinels.length) return;

    const updateTriggers = (panelId: string | null, container: HTMLElement | null) => {
      if (!panelId || !container) return;
      const triggers = container.querySelectorAll<HTMLAnchorElement>(
        ".exhibit-tabs__trigger",
      );
      triggers.forEach((trigger) => {
        const controls = trigger.getAttribute("aria-controls");
        if (controls === panelId) {
          trigger.setAttribute("aria-current", "true");
        } else {
          trigger.removeAttribute("aria-current");
        }
      });
    };

    const logActive = (node: HTMLElement) => {
      const sectionId = node.dataset.sectionId || "unknown";
      const labelText = node.dataset.exhibitTabLabel || null;
      const panel = node.closest<HTMLElement>(".exhibit-tabs__panel");
      const container = panel?.closest<HTMLElement>(".exhibit-tabs");
      if (panel) updateTriggers(panel.id, container || null);
      // eslint-disable-next-line no-console
      console.log(
        "[ExhibitTabsHelper]",
        "active panel",
        sectionId,
        labelText ? `(${labelText})` : "",
      );
    };

    const runInitial = () => {
      if (sentinels[0]) {
        logActive(sentinels[0]);
      }
    };

    let frame: number | null = null;

    const resolveActive = () => {
      frame = null;
      const viewportTop = window.scrollY || 0;

      const best = sentinels.reduce<{distance: number; node: HTMLElement | null}>(
        (acc, node) => {
          const rect = node.getBoundingClientRect();
          const distance = Math.abs(window.scrollY + rect.top - viewportTop);
          if (distance < acc.distance) {
            return {distance, node};
          }
          return acc;
        },
        {distance: Number.POSITIVE_INFINITY, node: null},
      );

      if (best.node) {
        logActive(best.node);
      }
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(resolveActive);
    };

    schedule();

    window.addEventListener("scroll", schedule, {passive: true});
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    };
  }, []);

  return null;
}
