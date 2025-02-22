export class CommonForm {
  public static forLabel = (baseDataTestId: string): string => {
    return `${baseDataTestId}-label`;
  };

  public static forInstructions = (baseDataTestId: string): string => {
    return `${baseDataTestId}-instructions`;
  };

  public static forMessage = (baseDataTestId: string): string => {
    return `${baseDataTestId}-message`;
  };

  public static forContainer = (baseDataTestId: string): string => {
    return `${baseDataTestId}-container`;
  }

  public static forSelectTrigger = (baseDataTestId: string): string => {
    return `${baseDataTestId}-select-trigger`;
  }
}
