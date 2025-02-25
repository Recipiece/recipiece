import { FC, useMemo } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../shadcn";
import { ChevronFirst } from "lucide-react";
import { DataTestId } from "@recipiece/constant";

export interface PagerProps {
  readonly page: number;
  readonly onPage: (newPage: number) => void;
  readonly hasNextPage: boolean;
  readonly className?: string;
  readonly shortForm?: boolean;
  readonly dataTestId?: string;
}

export const Pager: FC<PagerProps> = ({ page, onPage, hasNextPage, className, shortForm, dataTestId }) => {
  const displayPage = useMemo(() => {
    return page + 1;
  }, [page]);

  return (
    <Pagination className={className || ""}>
      <PaginationContent>
        {page > 0 && (
          <PaginationItem data-testid={DataTestId.Pager.BUTTON_FIRST(dataTestId)}>
            <PaginationLink onClick={() => onPage(0)}>
              <ChevronFirst className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        )}
        {page > 0 && (
          <PaginationItem data-testid={DataTestId.Pager.BUTTON_PREVIOUS(dataTestId)}>
            <PaginationPrevious shortForm={shortForm} onClick={() => onPage(page - 1)} />
          </PaginationItem>
        )}
        <PaginationItem data-testid={DataTestId.Pager.BUTTON_CURRENT_PAGE(dataTestId)}>
          <PaginationLink>{displayPage}</PaginationLink>
        </PaginationItem>
        {hasNextPage && (
          <PaginationItem data-testid={DataTestId.Pager.BUTTON_NEXT_PAGE(dataTestId)}>
            <PaginationNext shortForm={shortForm} onClick={() => onPage(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
