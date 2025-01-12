import { Download } from "lucide-react";
import { FC, useCallback, useContext } from "react";
import { useGetSelfQuery, useRequestRecipeImportMutation } from "../../../api";
import { Button, Card, CardContent, CardFooter, CardHeader, H3, H4, InlineCode, Stack, Tooltip, TooltipContent, TooltipTrigger, useToast } from "../../../component";
import { DialogContext } from "../../../context";
import { ImportRecipesForm } from "../../../dialog";

export const ImportExportSection: FC = () => {
  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { mutateAsync: importRecipes } = useRequestRecipeImportMutation();
  const { toast } = useToast();

  const onImportRecipes = useCallback(() => {
    pushDialog("importRecipes", {
      onClose: () => popDialog("importRecipes"),
      onSubmit: async (formData: ImportRecipesForm) => {
        try {
          await importRecipes({
            file: formData.file[0],
            source: formData.source,
          });
        } catch {
          toast({
            title: "Cannot Import Recipes",
            description: "There was an error importing your recipes. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("importRecipes");
        }
      },
    });
  }, [pushDialog, popDialog, importRecipes, toast]);

  return (
    <Stack>
      <H3>Import & Export</H3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <H4>Import Data</H4>
          </CardHeader>
          <CardContent className="grow">
            <p className="text-sm">
              If you use another recipe application, or you have previously exported data from Recipiece, you can import that data into Recipiece using the below button. This
              operation can take some time depending on how much data you want to import. You will be emailed at <InlineCode>{user?.email}</InlineCode> when the import is finished.
            </p>
          </CardContent>
          <CardFooter>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="ml-auto" disabled={!user?.validated || isLoadingUser} onClick={onImportRecipes}>
                  Import Data <Download className="ml-2" />
                </Button>
              </TooltipTrigger>
              {!user?.validated && <TooltipContent>You must verify your email address before using this feature.</TooltipContent>}
            </Tooltip>
          </CardFooter>
        </Card>
      </div>
    </Stack>
  );
};
