import React from "react";

type ExhibitExperienceProps = React.PropsWithChildren<{
  ambientLabel?: string;
}>;

export default function ExhibitExperience({
  ambientLabel,
  children,
}: ExhibitExperienceProps) {
  return (
    <div className="exhibit-experience">
      <div className="exhibit-experience__ambient" aria-hidden="true" />
      <div className="exhibit-experience__shell">
        {ambientLabel ? (
          <div className="exhibit-experience__label" aria-hidden="true">
            {ambientLabel}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
