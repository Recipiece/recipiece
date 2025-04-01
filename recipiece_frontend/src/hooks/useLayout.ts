import { useMediaQuery } from "./usehooks";

export const useLayout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(min-width: 481px)");

  return {
    isDesktop,
    isMobile,
    isTablet: isTablet && !isDesktop,
  };
};
