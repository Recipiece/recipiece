export class MembershipsPage {
  public static readonly CONTEXT_MENU_TRIGGER = "memberships-context-menu-trigger";
  public static readonly CONTEXT_MENU_ITEM_SEND_INVITATION = "context-menu-item-send-invitation";

  public static readonly PENDING_MEMBERSHIP_NAME = (base?: any) => {
    return `pending-membership-name-${base}`;
  };

  public static readonly PENDING_MEMBERSHIP_SENT_AT = (base?: any) => {
    return `pending-membership-send-at-${base}`;
  };

  public static readonly BUTTON_ACCEPT_INVITE = (base?: any) => {
    return `button-accept-invite-${base}`;
  };

  public static readonly BUTTON_DENY_INVITE = (base?: any) => {
    return `button-deny-invite-${base}`;
  };

  public static readonly LINK_ACCEPTED_MEMBERSHIP = (base?: any) => {
    return `link-accepted-membership-${base}`;
  }

  public static readonly TOAST_INVITE_SENT = "toast-invite-sent";
  public static readonly TOAST_INVITE_SEND_FAILED = "toast-invite-send-failed";
  public static readonly TOAST_INVITE_ACCEPTED = "toast-invite-accepted";
  public static readonly TOAST_INVITE_DENIED = "toast-invite-denied";
  public static readonly TOAST_INVITE_ACCEPTED_FAILED = "toast-invite-accepted-failed";
  public static readonly TOAST_INVITE_DENIED_FAILED = "toast-invite-denied-failed";
}
