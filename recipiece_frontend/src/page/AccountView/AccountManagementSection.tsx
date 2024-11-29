import { FC } from "react";
import { useGetSelfQuery } from "../../api";
import { Button, Card, CardContent, CardFooter, CardHeader, Grid, GridHalfRow, Stack, Tooltip, TooltipContent, TooltipTrigger } from "../../component";
import { Download, Upload } from "lucide-react";

export const AccountManagementSection: FC = () => {
  const { data: account, isLoading: isLoadingAccount } = useGetSelfQuery();

  return (
    <Stack>
      <h1 className="text-lg">Manage Your Account</h1>
      <Grid>
        <GridHalfRow>
          <Card className="h-full flex flex-col">
            <CardHeader>Import Data</CardHeader>
            <CardContent className="grow">
              <p className="text-sm">
                If you use another recipe application, or you have previously exported data from Recipiece, you can import that data into Recipiece using the below button. This
                operation can take some time depending on how much data you want to import. You will be emailed at {account?.email} when the import is finished.
              </p>
            </CardContent>
            <CardFooter>
              <Tooltip>
                <TooltipTrigger className="flex flex-row grow">
                  <Button disabled={!account?.validated || isLoadingAccount} className="grow">
                    Import Data <Download className="ml-2" />
                  </Button>
                </TooltipTrigger>
                {!account?.validated && <TooltipContent>You must verify your email address before using this feature.</TooltipContent>}
              </Tooltip>
            </CardFooter>
          </Card>
        </GridHalfRow>

        <GridHalfRow>
          <Card className="h-full flex flex-col">
            <CardHeader>Export Data</CardHeader>
            <CardContent className="grow">
              <p className="text-sm">
                If you want to download all of your data, you can request it to be exported. This data will include all your recipes and their associated parts, and all of your
                user data, excluding your credentials. The exported data will be emailed to {account?.email}.
              </p>
            </CardContent>
            <CardFooter>
              <Tooltip>
                <TooltipTrigger className="flex flex-row grow">
                  <Button disabled={!account?.validated || isLoadingAccount} className="grow">
                    Export Data <Upload className="ml-2" />
                  </Button>
                </TooltipTrigger>
                {!account?.validated && <TooltipContent>You must verify your email address before using this feature.</TooltipContent>}
              </Tooltip>
            </CardFooter>
          </Card>
        </GridHalfRow>

        <GridHalfRow>
          <Card className="h-full flex flex-col">
            <CardHeader>Change Password</CardHeader>
            <CardContent className="grow">
              <p className="text-sm">If you want to change your password, you can click the button below.</p>
            </CardContent>
            <CardFooter>
              <Button disabled={isLoadingAccount} className="grow">
                Change Password
              </Button>
            </CardFooter>
          </Card>
        </GridHalfRow>

        <GridHalfRow>
          <Card>
            <CardHeader>Delete Account</CardHeader>
            <CardContent>
              <Stack>
                <p className="text-sm">
                  If you wish to delete your account, use the below button to do so. It is recommended that you export your data first.
                  <br />
                  <br />
                  <b>ONCE YOUR ACCOUNT IS DELETED, YOU WILL NOT BE ABLE TO ACCESS ANY OF YOUR RECIPIECE DATA.</b>
                  <br />
                  <br />
                  <b>THIS ACTION IS PERMANENT AND CANNOT BE UNDONE.</b>
                </p>
                <Button disabled={isLoadingAccount} variant="destructive">
                  Delete Your Account
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </GridHalfRow>
      </Grid>
    </Stack>
  );
};
