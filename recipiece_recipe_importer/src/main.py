from fastapi import FastAPI
from .model.recipe import ParseRecipeRequest, ParseRecipeResponse
from .api.recipe import parse_recipe_from_url
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
