import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCookbookMutation, useListCookbooksQuery, useLogoutUserMutation } from "../../../api";
import { Cookbook } from "../../../data";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger, Separator, useToast } from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";
import { Pager } from "../Pager";
import { RecipieceHeader } from "../Typography";
import { useCreateCookbookDialog } from "../../../hooks";
import { CreateCookbookForm } from "../../../dialog";

export const RecipieceMenubar: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cookbooksPage, setCookbooksPage] = useState(0);
  const { mutateAsync: logout } = useLogoutUserMutation({
    onSuccess: () => {
      navigate("/login");
    },
    onFailure: () => {
      navigate("/login");
    },
  });

  const onSelectCookbook = useCallback((cookbook: Cookbook) => {
    navigate(`/cookbook/${cookbook?.id}`);
  }, []);

  const onGoHome = useCallback(() => {
    navigate("/dashboard");
  }, []);

  const { data: cookbooks, isLoading: isLoadingCookbooks } = useListCookbooksQuery({
    page: cookbooksPage,
  });

  const { mutateAsync: createCookbook } = useCreateCookbookMutation({
    onSuccess: () => {
      setIsDialogOpen(false);
      toast({
        title: "Cookbook Created",
        description: "Your cookbook has been successfully created!",
      });
    },
    onFailure: () => {
      setIsDialogOpen(false);
      toast({
        title: "Could not Create Cookbook",
        description: "This cookbook couldn't be created. Try again later.",
        variant: "destructive",
      });
    },
  })

  const onCreateCookbook = async (cookbookData: CreateCookbookForm) => {
    await createCookbook({...cookbookData});
  };

  const { setIsDialogOpen } = useCreateCookbookDialog({
    onClose: () => setIsDialogOpen(false),
    onSubmit: onCreateCookbook,
  });

  return (
    <Menubar className="rounded-none border-0 p-4 h-12 bg-primary text-white">
      <RecipieceHeader className="text-center w-full md:w-auto md:mr-auto" />
      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger onClick={onGoHome}>Home</MenubarTrigger>
        </MenubarMenu>
      </span>

      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger>Cookbooks</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsDialogOpen(true)}>New Cookbook</MenubarItem>
            <LoadingGroup isLoading={isLoadingCookbooks} className="w-full h-10">
              {cookbooks?.data && <Separator />}
              {(cookbooks?.data || []).map((cookbook) => {
                return (
                  <MenubarItem onClick={() => onSelectCookbook(cookbook)} key={cookbook.id}>
                    {cookbook.name}
                  </MenubarItem>
                );
              })}
              {cookbooks?.data && <Pager shortForm={true} page={cookbooksPage} onPage={setCookbooksPage} hasNextPage={cookbooks?.hasNextPage} />}
            </LoadingGroup>
          </MenubarContent>
        </MenubarMenu>
      </span>

      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger>Create</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/recipe/edit/new?source=url")}>Recipe From URL</MenubarItem>
            <MenubarItem onClick={() => navigate("/recipe/edit/new")}>New Recipe</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </span>

      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger>Account</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/account")}>My Account</MenubarItem>
            <MenubarItem onClick={() => logout()}>Sign Out</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </span>
    </Menubar>
  );
};
