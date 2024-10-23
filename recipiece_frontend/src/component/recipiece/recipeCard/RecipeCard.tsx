import { FC } from "react";
import { Recipe } from "../../../data";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../shadcn";
import { BookX, Pencil, SquareArrowOutUpRight } from "lucide-react";

export interface RecipeCardProps {
  readonly recipe: Recipe;
  readonly onView?: (recipe: Recipe) => void;
  readonly onEdit?: (recipe: Recipe) => void;
  readonly onDelete?: (recipe: Recipe) => void;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, onDelete, onEdit, onView }) => {
  return (
    <Card className="h-full flex flex-col hover:drop-shadow-md">
      <CardHeader className="hover:cursor-pointer" onClick={() => onView?.(recipe)}>
        <CardTitle>{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent className="grow hover:cursor-pointer">
        <p className="max-h-32 overflow-hidden line-clamp-3">{recipe.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="link" onClick={() => onDelete?.(recipe)}>
          <BookX />
        </Button>
        <Button variant="link" onClick={() => onEdit?.(recipe)}>
          <Pencil />
        </Button>
        <Button className="ml-auto" variant="link" onClick={() => onView?.(recipe)}>
          <SquareArrowOutUpRight />
        </Button>
      </CardFooter>
    </Card>
  );
};
