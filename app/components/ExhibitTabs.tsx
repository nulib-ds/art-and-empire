import React from "react";

type ExhibitTabProps = {
  id: string;
  label: string;
  children: React.ReactNode;
};

function extractTabs(children: React.ReactNode) {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) return [];
    const props = child.props as ExhibitTabProps;
    if (!props?.id || !props?.label) return [];

    return [
      {
        id: props.id,
        label: props.label,
        content: props.children,
      },
    ];
  });
}

export function ExhibitTab({children}: ExhibitTabProps) {
  return <div style={{paddingTop: "4rem"}}>{children}</div>;
}

type ExhibitTabsProps = React.PropsWithChildren<{
  defaultTab?: string;
}>;

const getPanelDomId = (tabId: string) => {
  const sanitized = tabId
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized ? `panel-${sanitized}` : "panel";
};

export default function ExhibitTabs({defaultTab, children}: ExhibitTabsProps) {
  const tabs = extractTabs(children);
  const rawBaseId = React.useId();
  const baseId = React.useMemo(() => {
    // Strip non-url-safe characters from the generated id so anchors look clean.
    const sanitized = rawBaseId
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "");
    if (sanitized) return sanitized;

    const charCodeHash = Array.from(rawBaseId)
      .map((char) => char.charCodeAt(0).toString(36))
      .join("");
    return `exhibit-tabs-${charCodeHash}`;
  }, [rawBaseId]);
  const tabRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);
  const panelRefs = React.useRef<Record<string, HTMLElement | null>>({});

  const resolvedDefaultSectionId = React.useMemo(() => {
    if (!tabs.length) return null;
    if (defaultTab && tabs.some((tab) => tab.id === defaultTab)) {
      return defaultTab;
    }
    return tabs[0]?.id ?? null;
  }, [defaultTab, tabs]);

  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(
    resolvedDefaultSectionId,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{sectionId: string; tabsId: string}>;
      if (!custom?.detail) return;
      if (custom.detail.tabsId !== baseId) return;
      setActiveSectionId(custom.detail.sectionId);
    };

    window.addEventListener("exhibitTabsActive", handler as EventListener);
    return () => {
      window.removeEventListener("exhibitTabsActive", handler as EventListener);
    };
  }, [baseId]);

  React.useEffect(() => {
    setActiveSectionId((current) => {
      if (current && tabs.some((tab) => tab.id === current)) return current;
      return resolvedDefaultSectionId;
    });
  }, [tabs, resolvedDefaultSectionId]);

  React.useEffect(() => {
    if (!defaultTab) return;
    if (!tabs.some((tab) => tab.id === defaultTab)) return;
    setActiveSectionId(defaultTab);
  }, [defaultTab, tabs]);

  React.useEffect(() => {
    const knownIds = new Set(tabs.map((tab) => tab.id));
    Object.keys(panelRefs.current).forEach((key) => {
      if (!knownIds.has(key)) {
        delete panelRefs.current[key];
      }
    });
  }, [tabs]);

  React.useEffect(() => {
    if (!activeSectionId) return;
    const index = tabs.findIndex((tab) => tab.id === activeSectionId);
    if (index < 0) return;
    const node = tabRefs.current[index];
    if (!node || typeof node.scrollIntoView !== "function") return;
    const scheduler =
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(cb, 0);
    scheduler(() => {
      try {
        node.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      } catch (_) {
        node.scrollIntoView();
      }
    });
  }, [activeSectionId, tabs]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!tabs.length) return;

    let frame: number | null = null;

    const resolveActiveSection = () => {
      frame = null;

      const navHeight = (() => {
        const firstPanel = panelRefs.current[tabs[0]?.id ?? ""];
        const navNode = tabRefs.current[0]?.closest(".exhibit-tabs__bar");
        if (!navNode) return 0;
        const rect = navNode.getBoundingClientRect();
        return rect.height;
      })();

      const focusLine = window.scrollY + navHeight + 16;

      let closestId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      tabs.forEach((tab) => {
        const node = panelRefs.current[tab.id];
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const distance = Math.abs(sectionTop - focusLine);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = tab.id;
        }
      });

      if (!closestId) return;
      setActiveSectionId((current) =>
        current === closestId ? current : closestId,
      );
    };

    const scheduleMeasurement = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(resolveActiveSection);
    };

    scheduleMeasurement();
    window.addEventListener("scroll", scheduleMeasurement, {passive: true});
    window.addEventListener("resize", scheduleMeasurement);

    return () => {
      window.removeEventListener("scroll", scheduleMeasurement);
      window.removeEventListener("resize", scheduleMeasurement);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    };
  }, [tabs]);

  if (!tabs.length) return null;

  const focusTriggerAtIndex = (index: number) => {
    const node = tabRefs.current[index];
    if (!node || typeof node.focus !== "function") return;
    try {
      node.focus({preventScroll: true});
    } catch (_) {
      node.focus();
    }
  };

  const scrollToSection = (sectionId: string, panelDomId: string) => {
    let node = panelRefs.current[sectionId];
    if (!node && typeof document !== "undefined") {
      node = document.getElementById(panelDomId) as HTMLElement | null;
    }
    if (!node) return;
    setActiveSectionId(sectionId);
    if (typeof node.scrollIntoView === "function") {
      try {
        node.scrollIntoView({behavior: "smooth", block: "start"});
      } catch (_) {
        node.scrollIntoView();
      }
    }
  };

  const activateSectionAtIndex = (index: number) => {
    const tab = tabs[index];
    if (!tab) return;
    const panelDomId = getPanelDomId(tab.id);
    scrollToSection(tab.id, panelDomId);
    const scheduler =
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(cb, 0);
    scheduler(() => focusTriggerAtIndex(index));
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!tabs.length) return;
    const lastIndex = tabs.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = index === lastIndex ? 0 : index + 1;
      activateSectionAtIndex(nextIndex);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = index === 0 ? lastIndex : index - 1;
      activateSectionAtIndex(prevIndex);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      activateSectionAtIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      activateSectionAtIndex(lastIndex);
    }
  };

  return (
    <div className="exhibit-tabs" data-exhibit-tabs-id={baseId}>
      <nav
        className="exhibit-tabs__bar"
        role="navigation"
        aria-label="Exhibit sections"
      >
        {tabs.map((tab, index) => {
          const panelId = getPanelDomId(tab.id);
          const isActive = tab.id === activeSectionId;

          return (
            <a
              href={`#${panelId}`}
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              className="exhibit-tabs__trigger"
              aria-controls={panelId}
              aria-current={isActive ? "true" : undefined}
              data-exhibit-tab-label={tab.label}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(tab.id, panelId);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>
      <div className="exhibit-tabs__panels">
        {tabs.map((tab) => {
          const panelId = getPanelDomId(tab.id);

          return (
            <div
              key={tab.id}
              className="exhibit-tabs__panel"
              id={panelId}
              data-section-id={tab.id}
              data-exhibit-tab-label={tab.label}
              ref={(node) => {
                panelRefs.current[tab.id] = node;
              }}
            >
              <div
                className="exhibit-tabs__sentinel"
                data-exhibit-tab-sentinel
                data-exhibit-tabs-id={baseId}
                data-section-id={tab.id}
                data-exhibit-tab-label={tab.label}
              />
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
