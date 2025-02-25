export class RecipeImportFiles {
  public static readonly MAX_SIZE = 4000000;
  public static readonly SUPPORTED_EXTENSIONS = [".paprikarecipes"];
  public static readonly TMP_DIR = "/tmp/recipe_import";
  public static readonly IMPORT_TOPIC = "recipiece_file_import";
}

export class UserKitchenInvitationStatus {
  public static readonly PENDING = "pending";
  public static readonly DENIED = "denied";
  public static readonly ACCEPTED = "accepted";

  public static readonly ALL_STATUSES: [typeof UserKitchenInvitationStatus.PENDING, typeof UserKitchenInvitationStatus.DENIED, typeof UserKitchenInvitationStatus.ACCEPTED] = [
    UserKitchenInvitationStatus.PENDING,
    UserKitchenInvitationStatus.DENIED,
    UserKitchenInvitationStatus.ACCEPTED,
  ];
}
