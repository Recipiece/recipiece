import { FC, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../shadcn";
import { ChevronFirst } from "lucide-react";

export interface PagerProps {
  readonly page: number;
  readonly onPage: (newPage: number) => void;
  readonly hasNextPage: boolean;
  readonly className?: string;
}

export const Pager: FC<PagerProps> = ({ page, onPage, hasNextPage, className }) => {
  const displayPage = useMemo(() => {
    return page + 1;
  }, [page]);

  return (
    <Pagination className={className || ""}>
      <PaginationContent>
        {page > 0 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPage(0)}>
              <ChevronFirst className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        )}
        {page > 0 && (
          <PaginationItem>
            <PaginationPrevious onClick={() => onPage(page - 1)} />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink>{displayPage}</PaginationLink>
        </PaginationItem>
        {hasNextPage && (
          <PaginationItem>
            <PaginationNext onClick={() => onPage(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
