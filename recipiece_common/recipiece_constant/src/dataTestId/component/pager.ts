export class Pager {
  public static readonly BUTTON_FIRST = (base?: string): string => {
    return `button-first-${base}`;
  }

  public static readonly BUTTON_PREVIOUS = (base?: string): string => {
    return `button-previous-${base}`;
  }

  public static readonly BUTTON_CURRENT_PAGE = (base?: string): string => {
    return `button-current-page-${base}`;
  }

  public static readonly BUTTON_NEXT_PAGE = (base?: string): string => {
    return `button-next-page-${base}`;
  }

  public static readonly NAV_PAGER = (base?: string): string => {
    return `nav-pager-${base}`;
  }
}