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

export function ExhibitTab({ children }: ExhibitTabProps) {
  return <>{children}</>;
}

type ExhibitTabsProps = React.PropsWithChildren<{
  defaultTab?: string;
}>;

export default function ExhibitTabs({ defaultTab, children }: ExhibitTabsProps) {
  const tabs = extractTabs(children);
  const baseId = React.useId();
  const radioName = `exhibit-tabs-${baseId}`;

  if (!tabs.length) return null;

  return (
    <div className="exhibit-tabs" role="tablist" aria-label="Exhibit views">
      {tabs.map((tab, index) => {
        const inputId = `${baseId}-${tab.id}`;
        const isDefault = defaultTab ? tab.id === defaultTab : index === 0;

        const labelId = `${inputId}-label`;

        return (
          <div className="exhibit-tabs__entry" key={tab.id}>
            <input
              type="radio"
              name={radioName}
              id={inputId}
              className="exhibit-tabs__radio"
              defaultChecked={isDefault}
              aria-labelledby={labelId}
            />
            <label
              className="exhibit-tabs__trigger"
              htmlFor={inputId}
              role="tab"
              id={labelId}
              aria-controls={`panel-${tab.id}`}
            >
              {tab.label}
            </label>
            <div
              className="exhibit-tabs__panel"
              id={`panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={labelId}
            >
              {tab.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
