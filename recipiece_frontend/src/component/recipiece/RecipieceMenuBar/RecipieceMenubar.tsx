import { FC, useCallback, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useListCookbooksQuery, useLogoutUserMutation } from "../../../api";
import { CreateCookbookDialog } from "../../../dialog";
import { DialogTrigger, Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger, Separator } from "../../shadcn";
import { RecipieceHeader } from "../Typography";
import { LoadingGroup } from "../LoadingGroup";
import { CookbookContext } from "../../../context";
import { Cookbook } from "../../../data";
import { Pager } from "../Pager";

export const RecipieceMenubar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookbooksPage, setCookbooksPage] = useState(0);
  const { mutateAsync: logout } = useLogoutUserMutation({
    onSuccess: () => {
      navigate("/login");
    },
    onFailure: () => {
      navigate("/login");
    },
  });

  const { setCurrentCookbook } = useContext(CookbookContext);

  const onSelectCookbook = useCallback((cookbook?: Cookbook) => {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
    setCurrentCookbook(cookbook);
  }, [location]);

  const onGoHome = useCallback(() => {
    setCurrentCookbook(undefined);
    navigate("/dashboard");
  }, []);

  const { data: cookbooks, isLoading: isLoadingCookbooks } = useListCookbooksQuery({
    page: cookbooksPage,
  });

  return (
    <CreateCookbookDialog>
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
              <DialogTrigger asChild>
                <MenubarItem>New Cookbook</MenubarItem>
              </DialogTrigger>
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
    </CreateCookbookDialog>
  );
};
