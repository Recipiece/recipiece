with 
    expanded_recipes 
as (
    select 
        -- a recipe and all its associated entities
        recipes.*,
        (select jsonb_agg(recipe_ingredients.* order by "order" asc) from recipe_ingredients where recipe_ingredients.recipe_id = recipes.id) as ingredients,
        (select jsonb_agg(recipe_steps.* order by "order" asc) from recipe_steps where recipe_steps.recipe_id = recipes.id) as steps,
        (select jsonb_agg(recipe_shares.*) from recipe_shares where recipe_shares.recipe_id = recipes.id) as shares,
        (select jsonb_agg(user_tags.*) from user_tags join recipe_tag_attachments on recipe_tag_attachments.user_tag_id = user_tags.id where recipe_tag_attachments.recipe_id = recipes.id) as tags,
        -- tester cols to filter on
        (select recipe_ingredients.id from recipe_ingredients where recipe_ingredients.recipe_id = recipes.id and recipe_ingredients.name ilike '%beef%' limit 1) as filtered_ingredient,
        (select user_tags.id from user_tags join recipe_tag_attachments on recipe_tag_attachments.user_tag_id = user_tags.id where recipe_tag_attachments.recipe_id = recipes.id and user_tags.content ilike '%beef%' limit 1) as filtered_tag
    from 
        recipes
)
select 
    *
from 
    expanded_recipes
where 
    expanded_recipes.filtered_ingredient is not null
limit 1
;
