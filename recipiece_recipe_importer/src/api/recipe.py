from typing import List
from ..model.recipe import ParseRecipeResponse, ParseIngredientsResponse, ParsedIngredient
from http import HTTPStatus
from fastapi import HTTPException
from recipe_scrapers import scrape_html, WebsiteNotImplementedError
from ingredient_parser import parse_ingredient
import requests
import logging

logger = logging.getLogger("recipe")
logger.setLevel(logging.INFO)


def parse_freetext_ingredients(ingredients: List[str]) -> List[ParsedIngredient]:
    parsed_ingredients = []
    for ingredient in ingredients:
        try:
            parsed_ingredient = parse_ingredient(ingredient) 

            if parsed_ingredient and parsed_ingredient.name:
                ing_name = parsed_ingredient.name.text
                if parsed_ingredient.preparation and parsed_ingredient.preparation.text:
                    ing_name += f", {parsed_ingredient.preparation.text}"

                ing_amount = None
                ing_unit = None
                if parsed_ingredient.amount:
                    if hasattr(parsed_ingredient.amount[0], "quantity") and parsed_ingredient.amount[0].quantity:
                        ing_amount = str(parsed_ingredient.amount[0].quantity)
                    if hasattr(parsed_ingredient.amount[0], "unit") and parsed_ingredient.amount[0].unit:
                        ing_unit = str(parsed_ingredient.amount[0].unit)

                parsed_ingredients.append({
                    "name": ing_name,
                    "amount": ing_amount,
                    "unit": ing_unit,
                })
            else:
                logger.warning(f"unable to parse ingredient {ingredient}, blindly setting the name field :(")
                parsed_ingredients.append({
                    "name": ingredient,
                    "amount": None,
                    "unit": None,
                })
        except Exception as ex:
            logger.exception(ex)
            logger.warning(f"unable to parse ingredient {ingredient}, blindly setting the name field :(")
            parsed_ingredients.append({
                "name": ingredient,
                "amount": None,
                "unit": None,
            })

    return parsed_ingredients


def parse_recipe_from_url(source_url: str) -> ParseRecipeResponse:
    html = requests.get(source_url, headers={"User-Agent": "Recipiece"}).content
    try:
        scraper = scrape_html(html, org_url=source_url)
        recipe_json = scraper.to_json()
        parsed_recipe = dict(**recipe_json)
        parsed_recipe["parsed_ingredients"] = parse_freetext_ingredients(recipe_json.get("ingredients", []))

        return parsed_recipe
    except WebsiteNotImplementedError:
        logger.info(f"Unable to parse recipe because {source_url=} is not supported")
        raise HTTPException(status_code=HTTPStatus.UNPROCESSABLE_ENTITY)
