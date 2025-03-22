import { FC, PropsWithChildren, ReactNode, useMemo } from "react";

export const StaticTableHeader: FC<PropsWithChildren> = ({ children }) => {
  const allChildren: (typeof children)[] = useMemo(() => {
    if (!children) {
      return [];
    }

    if ((children as ReactNode[]).length) {
      return children as (typeof children)[];
    }
    return [children];
  }, [children]);

  return (
    <thead>
      <tr className="m-0 border-t p-0 even:bg-muted">
        {allChildren.map((ch, index) => {
          return (
            <th
              key={index}
              className="border px-4 py-2 text-left font-bold dark:border-muted [&[align=center]]:text-center [&[align=right]]:text-right"
            >
              {ch}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export const StaticTableBody: FC<PropsWithChildren> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const StaticTableRow: FC<PropsWithChildren> = ({ children }) => {
  const allChildren: (typeof children)[] = useMemo(() => {
    if (!children) {
      return [];
    }

    if ((children as ReactNode[]).length) {
      return children as (typeof children)[];
    }
    return [children];
  }, [children]);

  return (
    <tr className="m-0 border-t p-0">
      {allChildren.map((ch, index) => {
        return (
          <td
            key={index}
            className="border px-4 py-2 text-left dark:border-muted [&[align=center]]:text-center [&[align=right]]:text-right"
          >
            {ch}
          </td>
        );
      })}
    </tr>
  );
};

export const StaticTable: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  );
};
