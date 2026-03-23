import React from "react";

type ExhibitPanelVariant = "default" | "intro" | "gallery" | "map";

type ExhibitPanelProps = React.PropsWithChildren<{
  variant?: ExhibitPanelVariant;
}>;

export default function ExhibitPanel({
  variant = "default",
  children,
}: ExhibitPanelProps) {
  const classes = ["exhibit-panel", `exhibit-panel--${variant}`].join(" ");

  return (
    <section className={classes}>
      <div className="exhibit-panel__chrome" aria-hidden="true" />
      <div className="exhibit-panel__body">{children}</div>
    </section>
  );
}
