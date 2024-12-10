import { FC } from "react";
import { useListCookbooksQuery } from "../../api";
import { Button, LoadingGroup } from "../../component";
import { Cookbook } from "../../data";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export const MobileListCookbooksDialog: FC<BaseDialogProps<Cookbook>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveTitle } = useResponsiveDialogComponents();
  const { data: cookbooks, isLoading: isLoadingCookbooks } = useListCookbooksQuery({
    page_number: 0,
  });

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Cookbooks</ResponsiveTitle>
      </ResponsiveHeader>
      <div className="grid grid-cols-1 gap-2 p-2 overflow-scroll">
        <LoadingGroup variant="spinner" isLoading={isLoadingCookbooks}>
          {(cookbooks?.data || []).map((cookbook) => {
            return (
              <Button key={cookbook.id} variant="link" onClick={() => onSubmit?.(cookbook)}>
                {cookbook.name}
              </Button>
            );
          })}
        </LoadingGroup>
      </div>
    </ResponsiveContent>
  );
};
