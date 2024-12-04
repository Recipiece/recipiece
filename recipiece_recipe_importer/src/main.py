from fastapi import FastAPI
from .model.recipe import ParseRecipeRequest, ParseRecipeResponse, ParseIngredientsRequest, ParseIngredientsResponse
from .api.recipe import parse_recipe_from_url, parse_freetext_ingredients
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

app = FastAPI()

@app.get("/")
def hello_world():
    return "hello world"

@app.post("/recipe/parse")
def root(request: ParseRecipeRequest) -> ParseRecipeResponse:
    url = request.source_url
    return parse_recipe_from_url(url)

@app.post("/ingredients/parse")
def parse_freetext_ingredient(request: ParseIngredientsRequest) -> ParseIngredientsResponse:
    return parse_freetext_ingredients(request.ingredients)
