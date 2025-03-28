import { Constant } from "@recipiece/constant";
import { RecipeSchema } from "@recipiece/types";
import { CSSProperties, FC, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormFile } from "../../component";
import { RecipeEditFormData } from "./RecipeEditFormSchema";

export const RecipeImageUploadForm: FC<{ readonly recipe?: RecipeSchema; readonly isLoading?: boolean }> = ({ recipe, isLoading }) => {
  const form = useFormContext<RecipeEditFormData>();
  const originalImageUrl = recipe?.image_url;
  const desiredUploadImage = form.watch("image");

  const [displayDivStyle, setDisplayDivStyle] = useState<CSSProperties>();

  /**
   * set a recipe image into the div when the user uploads a file
   */
  useEffect(() => {
    if (!isLoading) {
      if (desiredUploadImage) {
        const rawFile = desiredUploadImage.item(0);
        if (rawFile) {
          const reader = new FileReader();
          reader.addEventListener("load", function () {
            setDisplayDivStyle({
              backgroundImage: `url(${reader.result})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            });
          });
          reader.readAsDataURL(rawFile);
        }
      } else if (originalImageUrl) {
        setDisplayDivStyle({
          backgroundImage: `url(${originalImageUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        });
      } else {
        setDisplayDivStyle({
          borderStyle: "dashed",
          borderColor: "grey",
          borderWidth: "2px",
        });
      }
    }
  }, [desiredUploadImage, originalImageUrl]);

  return (
    <div className="flex flex-col gap-2 sm:h-full">
      <FormFile isLoading={isLoading} name="image" label="Image" accept={Constant.RecipeImage.ALLOWED_EXTENSIONS.join(",")} />
      <div style={displayDivStyle} className="max-h-64 h-64 sm:max-h-full sm:flex-grow w-full rounded-md" />
    </div>
  );
};
