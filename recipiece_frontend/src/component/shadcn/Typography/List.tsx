import { FC, PropsWithChildren, ReactNode, useMemo } from "react";

export const List: FC<PropsWithChildren & { readonly ordered?: boolean }> = ({ children, ordered = false }) => {
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
    <>
      {ordered && (
        <ol className="my-6 ml-6 list-disc [&>li]:mt-2">
          {allChildren.map((ch, index) => {
            return <li key={index}>{ch}</li>;
          })}
        </ol>
      )}
      {!ordered && (
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          {allChildren.map((ch, index) => {
            return <li key={index}>{ch}</li>;
          })}
        </ul>
      )}
    </>
  );
};
