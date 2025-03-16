import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { ListCookbooksQuerySchema, ListCookbooksResponseSchema, YListCookbooksResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listCookbooks = async (
  req: AuthenticatedRequest<any, ListCookbooksQuerySchema>,
  tx: PrismaTransaction
): ApiResponse<ListCookbooksResponseSchema> => {
  const user = req.user;
  const {
    page_number,
    page_size = Constant.DEFAULT_PAGE_SIZE,
    recipe_id,
    recipe_id_filter,
    search,
    shared_cookbooks_filter,
  } = req.query;

  let query = tx.$kysely
    .with("owned_cookbooks", (db) => {
      return db
        .selectFrom("cookbooks")
        .selectAll("cookbooks")
        .select((eb) => {
          return eb.lit(-1).as("user_kitchen_membership_id");
        })
        .where("cookbooks.user_id", "=", user.id);
    })
    .with("shared_cookbooks", (db) => {
      return db
        .selectFrom("user_kitchen_memberships")
        .innerJoin("users", "users.id", "user_kitchen_memberships.source_user_id")
        .innerJoin("cookbooks", "cookbooks.user_id", "user_id")
        .where((eb) => {
          return eb.or([
            eb.and([
              eb("user_kitchen_memberships.destination_user_id", "=", user.id),
              eb("user_kitchen_memberships.source_user_id", "=", eb.ref("cookbooks.user_id")),
            ]),
            eb.and([
              eb("user_kitchen_memberships.source_user_id", "=", user.id),
              eb("user_kitchen_memberships.destination_user_id", "=", eb.ref("cookbooks.user_id")),
            ]),
          ]);
        })
        .where((eb) => {
          return eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
        })
        .selectAll("cookbooks")
        .select("user_kitchen_memberships.id as user_kitchen_membership_id");
    })
    .with("all_cookbooks", (db) => {
      if (shared_cookbooks_filter === "include") {
        return db
          .selectFrom("owned_cookbooks")
          .union((eb) => {
            return eb.selectFrom("shared_cookbooks").selectAll();
          })
          .selectAll();
      } else {
        return db.selectFrom("owned_cookbooks").selectAll();
      }
    })
    .selectFrom("all_cookbooks")
    .selectAll("all_cookbooks");

  if (search) {
    query = query.where((eb) => {
      return eb(eb.fn("lower", ["all_cookbooks.name"]), "~*", search);
    });
  }

  if (recipe_id) {
    if (recipe_id_filter === "include") {
      query = query.where((eb) => {
        return eb(
          eb
            .selectFrom("recipe_cookbook_attachments")
            .select("recipe_cookbook_attachments.recipe_id")
            .where("recipe_cookbook_attachments.recipe_id", "=", recipe_id)
            .whereRef("recipe_cookbook_attachments.cookbook_id", "=", "all_cookbooks.id"),
          "is not",
          null
        );
      });
    } else if (recipe_id_filter === "exclude") {
      query = query.where((eb) => {
        return eb.and([
          eb(
            eb
              .selectFrom("recipe_cookbook_attachments")
              .select("recipe_cookbook_attachments.recipe_id")
              .where("recipe_cookbook_attachments.recipe_id", "=", recipe_id)
              .whereRef("recipe_cookbook_attachments.cookbook_id", "=", "all_cookbooks.id"),
            "is",
            null
          ),
          eb.or([
            eb("all_cookbooks.user_id", "=", user.id),
            eb(
              eb
                .selectFrom("user_kitchen_memberships")
                .select("user_kitchen_memberships.id")
                .whereRef("user_kitchen_memberships.destination_user_id", "=", "all_cookbooks.user_id")
                .where((_eb) => _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"))
                .where("user_kitchen_memberships.source_user_id", "=", user.id),
              "is not",
              null
            ),
          ]),
        ]);
      });
    }
  }

  query = query.offset(page_number * page_size!).limit(page_size! + 1);
  query = query.orderBy("all_cookbooks.name asc");

  const cookbooks = await query.execute();

  const hasNextPage = cookbooks.length > page_size!;
  const resultsData = cookbooks.splice(0, page_size!);

  return [
    StatusCodes.OK,
    YListCookbooksResponseSchema.cast({
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    }),
  ];
};
