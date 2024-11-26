import { useMemo } from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "../component";
import { useLayout } from "./useLayout";

export const useResponsiveDialogComponents = () => {
  const { isMobile } = useLayout();

  const ResponsiveHeader = useMemo(() => {
    return isMobile ? DrawerHeader : DialogHeader;
  }, [isMobile]);

  const ResponsiveFooter = useMemo(() => {
    return isMobile ? DrawerFooter : DialogFooter;
  }, [isMobile]);

  const ResponsiveTitle = useMemo(() => {
    return isMobile ? DrawerTitle : DialogTitle;
  }, [isMobile]);

  const ResponsiveContent = useMemo(() => {
    return isMobile ? DrawerContent : DialogContent;
  }, [isMobile]);

  const ResponsiveDescription = useMemo(() => {
    return isMobile ? DrawerDescription : DialogDescription;
  }, [isMobile]);

  return {
    ResponsiveHeader,
    ResponsiveFooter,
    ResponsiveContent,
    ResponsiveDescription,
    ResponsiveTitle,
  };
};
