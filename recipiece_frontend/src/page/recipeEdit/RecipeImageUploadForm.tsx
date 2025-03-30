import { Constant } from "@recipiece/constant";
import { RecipeSchema } from "@recipiece/types";
import { X } from "lucide-react";
import { CSSProperties, FC, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button, FormFile, FormInput, FormRadioGroup, FormRadioGroupItem } from "../../component";
import { RecipeEditFormData } from "./RecipeEditFormSchema";

export interface RecipeImageUploadProps {
  readonly recipe?: RecipeSchema;
  readonly isLoading?: boolean;
  readonly onClearImage: () => void;
  readonly isImageMarkedForDeletion: boolean;
}

export const RecipeImageUploadForm: FC<RecipeImageUploadProps> = ({ recipe, isLoading, onClearImage, isImageMarkedForDeletion }) => {
  const form = useFormContext<RecipeEditFormData>();
  const originalImageUrl = recipe?.image_url;

  const desiredUploadImage = form.watch("image");
  const imageType = form.watch("image_type");
  const externalImageUrl = form.watch("external_image_url");

  const [displayDivStyle, setDisplayDivStyle] = useState<CSSProperties>();

  /**
   * set a recipe image into the display.
   */
  useEffect(() => {
    if (!isLoading) {
      if (desiredUploadImage && imageType === "file") {
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
      } else if (externalImageUrl && imageType === "url") {
        try {
          new URL(externalImageUrl);
          setDisplayDivStyle({
            backgroundImage: `url(${externalImageUrl})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          });
        } catch {
          // noop
        }
      } else if (originalImageUrl && !isImageMarkedForDeletion) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desiredUploadImage, originalImageUrl, externalImageUrl, imageType, isImageMarkedForDeletion]);

  return (
    <div className="flex flex-col gap-2 sm:h-full">
      <FormRadioGroup label="Image" isLoading={isLoading} name="image_type" layout="horizontal">
        <FormRadioGroupItem value="file" label="File" />
        <FormRadioGroupItem value="url" label="URL" />
      </FormRadioGroup>
      <div className="flex flex-row gap-2 items-end">
        {imageType === "file" && (
          <FormFile className="flex-grow" isLoading={isLoading} name="image" accept={Constant.RecipeImage.ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")} />
        )}
        {imageType === "url" && <FormInput className="flex-grow" isLoading={isLoading} name="external_image_url" placeholder="https://..." />}
        <Button variant="outline" onClick={onClearImage}>
          <X />
        </Button>
      </div>
      <div style={displayDivStyle} className="max-h-64 h-64 sm:max-h-full sm:flex-grow w-full rounded-md" />
    </div>
  );
};
