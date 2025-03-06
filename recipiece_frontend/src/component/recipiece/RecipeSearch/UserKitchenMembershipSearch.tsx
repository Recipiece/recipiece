import { Constant, DataTestId } from "@recipiece/constant";
import { XIcon } from "lucide-react";
import { FC, useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useListUserKitchenMembershipsQuery } from "../../../api";
import { Badge, FormField, FormItem, FormLabel } from "../../shadcn";
import { FormSwitch } from "../Form";
import { TypeaheadInput } from "../TypeaheadInput";
import { RecipeSearchForm } from "./RecipeSearchFormSchema";

export interface UserKitchenMembershipSearchProps {
  readonly disabled?: boolean;
  readonly dataTestId?: string;
}

export const UserKitchenMembershipSearch: FC<UserKitchenMembershipSearchProps> = ({ disabled, dataTestId }) => {
  const baseDataTestId = DataTestId.RecipeSearchBar.INPUT_USER_KITCHEN_MEMBERSHIP_SEARCH(dataTestId);
  const form = useFormContext<RecipeSearchForm>();
  const currentSearchTerm = form.watch("currentMembershipTerm");
  const showAllRecipes = form.watch("showAllRecipes");
  const userKitchenMembershipIds = form.watch("userKitchenMembershipIds");

  const { data: memberships, isLoading: isLoadingMemberships } = useListUserKitchenMembershipsQuery({
    targeting_self: true,
    page_number: 0,
  });

  const mappedMembershipIds: {
    readonly [key: string]: { readonly id: string | number; readonly source_user: { readonly username: string } };
  } = useMemo(() => {
    const base = memberships?.data?.reduce((previous, membership) => {
      return {
        ...previous,
        [membership.id]: { ...membership },
      };
    }, {});
    return {
      ...base,
      [Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER]: {
        id: Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER,
        source_user: {
          username: "My Recipes",
        },
      },
    };
  }, [memberships]);

  const autocompleteOptions = useMemo(() => {
    const base = (memberships?.data ?? [])
      .filter((membership) => {
        return !userKitchenMembershipIds.includes(membership.id.toString());
      })
      .map((membership) => {
        return membership.source_user.username;
      })
      .filter((membership) => {
        return membership.toLowerCase().includes(currentSearchTerm.toLowerCase().trim());
      });

    if (userKitchenMembershipIds.includes(Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER)) {
      return [...base];
    } else {
      return ["My Recipes", ...base];
    }
  }, [memberships, userKitchenMembershipIds, currentSearchTerm]);

  const onSelectAutocompleteOption = useCallback(
    (selectedItem: string) => {
      let matchingElement;
      if (selectedItem === "My Recipes") {
        matchingElement = {
          id: Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER,
        };
      } else {
        matchingElement = Object.values(mappedMembershipIds).find((membership) => {
          return membership.source_user.username === selectedItem;
        });
      }

      if (matchingElement) {
        form.setValue("userKitchenMembershipIds", [...userKitchenMembershipIds, matchingElement.id.toString()]);
        form.setValue("currentMembershipTerm", "");
      }
    },
    [form, mappedMembershipIds, userKitchenMembershipIds]
  );

  const onRemoveMembership = useCallback(
    (membershipId: string) => {
      form.setValue(
        "userKitchenMembershipIds",
        userKitchenMembershipIds.filter((memId) => {
          return memId !== membershipId;
        })
      );
    },
    [form, userKitchenMembershipIds]
  );

  /**
   * if they toggle the show all recipes, set the
   * user kitchen membership ids properly
   */
  useEffect(() => {
    if (showAllRecipes) {
      form.setValue("userKitchenMembershipIds", [Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL]);
    } else {
      form.setValue("userKitchenMembershipIds", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllRecipes]);

  return (
    <div className="flex flex-row items-start gap-4">
      <FormSwitch className="pt-[0.3em]" name="showAllRecipes" label="Show All Recipes" />
      <div className="flex-grow">
        {!showAllRecipes && (
          <>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="currentMembershipTerm"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel data-testid={DataTestId.Form.LABEL(baseDataTestId)}>
                        Only Recipes Belonging To
                      </FormLabel>
                      <TypeaheadInput
                        data-testid={baseDataTestId}
                        disabled={disabled}
                        placeholder="Search for a user..."
                        autocompleteOptions={autocompleteOptions}
                        isLoading={isLoadingMemberships}
                        onSelectItem={onSelectAutocompleteOption}
                        {...field}
                      />
                    </FormItem>
                  );
                }}
              />
              <div className="flex flex-row flex-wrap gap-2">
                {userKitchenMembershipIds
                  .filter((membershipId) => membershipId !== Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL)
                  .map((membershipId) => {
                    return (
                      <Badge
                        data-testid={DataTestId.RecipeSearchBar.BADGE_USER_KITCHEN_MEMBERSHIP_SEARCH(dataTestId)}
                        key={membershipId}
                        className="cursor-pointer"
                        onClick={() => onRemoveMembership(membershipId)}
                      >
                        {mappedMembershipIds[membershipId].source_user.username}
                        <XIcon className="ml-2" size={12} />
                      </Badge>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
