export class Form {
  public static readonly LABEL = (baseDataTestId?: string): string => {
    return `label-${baseDataTestId}`;
  };

  public static readonly DESCRIPTION = (baseDataTestId?: string): string => {
    return `description-${baseDataTestId}`;
  };

  public static readonly MESSAGE = (baseDataTestId?: string): string => {
    return `message-${baseDataTestId}`;
  };

  public static readonly  CONTAINER = (baseDataTestId?: string): string => {
    return `container-${baseDataTestId}`;
  }

  public static readonly SELECT_TRIGGER = (baseDataTestId?: string): string => {
    return `select-trigger-${baseDataTestId}`;
  }
}
