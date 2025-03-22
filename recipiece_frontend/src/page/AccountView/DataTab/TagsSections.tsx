import { UserTagSchema } from "@recipiece/types";
import { XIcon } from "lucide-react";
import { FC, useCallback } from "react";
import { useDeleteUserTagMutation, useListUserTagsQuery } from "../../../api";
import { Badge, H3, LoadingGroup, Stack, useToast } from "../../../component";

export const TagsSection: FC = () => {
  const { toast } = useToast();

  const { data: userTags, isLoading: isLoadingUserTags } = useListUserTagsQuery();
  const { mutateAsync: deleteTag, isPending: isDeletingTag } = useDeleteUserTagMutation();

  const onTagClicked = useCallback(
    async (tag: UserTagSchema) => {
      try {
        await deleteTag(tag);
        toast({
          title: "Tag Deleted",
          description: "Your tag was deleted",
        });
      } catch {
        toast({
          title: "Unable to Delete Tag",
          description: "This tag could not be deleted. Try again later.",
          variant: "destructive",
        });
      }
    },
    [deleteTag, toast]
  );

  return (
    <Stack>
      <H3>Tags</H3>
      <p className="text-sm">
        Below are all of your tags. Tags are automatically created when you tag Recipes while editing/creating them. You
        can remove a tag by clicking on it here.
      </p>
      <LoadingGroup isLoading={isLoadingUserTags} variant="spinner" className="mr-auto h-6 w-6">
        <div className="flex flex-row flex-wrap gap-2">
          {(userTags?.data ?? []).length === 0 && <p className="text-center text-sm">You have no tags.</p>}
          {userTags?.data.map((tag) => {
            return (
              <Badge
                className="cursor-pointer dark:text-white"
                key={tag.id}
                onClick={() => !isDeletingTag && onTagClicked(tag)}
              >
                {tag.content} <XIcon size={12} className="ml-2" />
              </Badge>
            );
          })}
        </div>
      </LoadingGroup>
    </Stack>
  );
};
