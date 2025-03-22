
with
owned_recipes as (
    select 
        recipes.*,
        null::jsonb as user_kitchen_membership,
        (select coalesce(jsonb_agg(recipe_shares.*), '[]'::jsonb) from recipe_shares where recipe_shares.recipe_id = recipes.id) as shares
    from recipes where user_id = 9
),
selectively_shared_recipes as (
    select 
        recipes.*,
        to_jsonb(user_kitchen_memberships.*) as user_kitchen_membership,
        '[]'::jsonb as shares
    from
        recipe_shares
    join
        user_kitchen_memberships on user_kitchen_memberships.id = recipe_shares.user_kitchen_membership_id
    join
        recipes on recipes.id = recipe_shares.id
    where 
        user_kitchen_memberships.destination_user_id = 9
        and user_kitchen_memberships.grant_level = 'SELECTIVE'
        and user_kitchen_memberships.status = 'accepted'
),
all_shared_recipes as (
    select
        recipes.*,
        to_jsonb(user_kitchen_memberships.*) as user_kitchen_membership,
        '[]'::jsonb as shares
    from
        user_kitchen_memberships
    join users on users.id = user_kitchen_memberships.source_user_id
    join recipes on recipes.user_id = users.id
    where
        user_kitchen_memberships.destination_user_id = 9
        and user_kitchen_memberships.grant_level = 'ALL'
        and user_kitchen_memberships.status = 'accepted'
),
all_recipes as (
    select * from owned_recipes
    union all
    select * from selectively_shared_recipes
    union all
    select * from all_shared_recipes
)
select
    all_recipes.*,
    (select coalesce(jsonb_agg(recipe_ingredients.* order by "order" asc), '[]'::jsonb) from recipe_ingredients where recipe_ingredients.recipe_id = all_recipes.id) as ingredients,
    (select coalesce(jsonb_agg(recipe_steps.* order by "order" asc), '[]'::jsonb) from recipe_steps where recipe_steps.recipe_id = all_recipes.id) as steps,
    (select coalesce(jsonb_agg(user_tags.*), '[]'::jsonb) from user_tags join recipe_tag_attachments on recipe_tag_attachments.user_tag_id = user_tags.id where recipe_tag_attachments.recipe_id = all_recipes.id) as tags
from all_recipes
where true
;