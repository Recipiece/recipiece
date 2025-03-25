import { CookbookSchema, RecipeSchema } from "@recipiece/types";
import { MoreVertical, Plus, Trash } from "lucide-react";
import { FC, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAttachRecipeToCookbookMutation, useDeleteCookbookMutation, useGetSelfQuery } from "../../api";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, LoadingGroup, useToast } from "../../component";
import { DialogContext } from "../../context";

export const CookbookContextMenu: FC<{ readonly cookbook: CookbookSchema }> = ({ cookbook }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();
  const { mutateAsync: createRecipeCookbookAttachment } = useAttachRecipeToCookbookMutation();
  const { mutateAsync: deleteCookbook } = useDeleteCookbookMutation();

  const onDeleteCookbook = () => {
    pushDialog("deleteCookbook", {
      cookbook: cookbook,
      onClose: () => popDialog("deleteCookbook"),
      onSubmit: async () => {
        try {
          await deleteCookbook({ ...cookbook });
          navigate("/dashboard");
          toast({
            title: "Cookbook Deleted",
            description: `${cookbook.name} was successfully deleted.`,
          });
        } catch {
          toast({
            title: "Unable to Delete Cookbook",
            description: `${cookbook.name} could not be deleted. Try again later.`,
            variant: "destructive",
          });
        } finally {
          popDialog("deleteCookbook");
        }
      },
    });
  };

  const onAddRecipeToCookbook = () => {
    pushDialog("searchRecipesForCookbook", {
      cookbook: cookbook,
      onClose: () => popDialog("searchRecipesForCookbook"),
      onSubmit: async (data: RecipeSchema) => {
        try {
          await createRecipeCookbookAttachment({
            recipe: data,
            cookbook: cookbook,
          });
          toast({
            title: "Recipe Added",
            description: `${data.name} was added to ${cookbook.name}`,
          });
        } catch {
          toast({
            title: "Failed to Add Recipe",
            description: `${data.name} could not be added to ${cookbook.name}. Try again later.`,
            variant: "destructive",
          });
        } finally {
          popDialog("searchRecipesForCookbook");
        }
      },
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto text-primary" onClick={() => setIsOpen(!isOpen)}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <LoadingGroup variant="skeleton" isLoading={isLoadingUser} className="w-full h-6">
          <DropdownMenuItem onClick={onAddRecipeToCookbook}>
            <Plus /> Add Recipe
          </DropdownMenuItem>

          {user?.id === cookbook.user_id && <DropdownMenuSeparator />}

          {user?.id === cookbook.user_id && (
            <DropdownMenuItem onClick={onDeleteCookbook} className="text-destructive">
              <Trash /> Delete Cookbook
            </DropdownMenuItem>
          )}
        </LoadingGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
