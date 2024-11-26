import { useMediaQuery } from "./usehooks";

export const useLayout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMobile = useMediaQuery("(max-width: 480px)");

  return {
    isDesktop,
    isMobile,
  };
};
