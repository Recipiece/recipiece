import { FC } from "react";
import { useParams } from "react-router-dom";
import { useGetRecipeByIdQuery } from "../../api";

export const RecipeViewPage: FC = () => {
  const { id } = useParams();
  const { data: recipe } = useGetRecipeByIdQuery(+id!, !!id);

  return <></>;
}