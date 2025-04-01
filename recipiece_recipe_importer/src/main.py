import logging

from fastapi import FastAPI

from .api.recipe import parse_freetext_ingredients, parse_recipe_from_url
from .model.recipe import (
    ParseIngredientsRequest,
    ParseIngredientsResponse,
    ParseRecipeRequest,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

app = FastAPI()

@app.get("/")
def hello_world():
    return "hello world"

@app.post("/recipe/parse")
def root(request: ParseRecipeRequest):
    url = request.source_url
    use_wild_mode = request.use_wild_mode
    return parse_recipe_from_url(url, use_wild_mode)

@app.post("/ingredients/parse")
def parse_freetext_ingredient(request: ParseIngredientsRequest) -> ParseIngredientsResponse:
    return {"ingredients": parse_freetext_ingredients(request.ingredients)}
