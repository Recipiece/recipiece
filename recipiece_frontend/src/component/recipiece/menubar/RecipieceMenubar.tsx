import { FC } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../../shadcn";
import { RecipieceHeader } from "../typography";
import { useLogoutUserMutation } from "../../../api";
import { useNavigate } from "react-router-dom";

export const RecipieceMenubar: FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutUserMutation({
    onSuccess: () => {
      navigate("/login");
    },
    onFailure: () => {
      navigate("/login");
    },
  });

  return (
    <Menubar className="rounded-none border-0 p-6 h-12 bg-primary text-white">
      <RecipieceHeader className="text-center w-full md:w-auto md:mr-auto" />
      <span className="invisible w-0 sm:w-auto sm:visible">
        <MenubarMenu>
          <MenubarTrigger>Create</MenubarTrigger>
        </MenubarMenu>
      </span>

      <span className="invisible w-0 sm:w-auto sm:visible">
        <MenubarMenu>
          <MenubarTrigger>Account</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => logout()}>Sign Out</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </span>
    </Menubar>
  );
};
