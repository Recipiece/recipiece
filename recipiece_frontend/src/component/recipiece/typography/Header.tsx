import { FC, HTMLProps, PropsWithChildren, useMemo } from "react";

export const Header: FC<PropsWithChildren & HTMLProps<HTMLHeadingElement>> = (
  props
) => {
  const { children, className, ...restProps } = props;

  const fullClassName = useMemo(() => {
    return `font-normal scroll-m-20 text-4xl tracking-tight ${className ?? ""}`;
  }, [className]);

  return <h1 className={fullClassName} {...restProps}>{children}</h1>;
};
