from fastapi import FastAPI
from .model.recipe import ParseRecipeRequest, ParseRecipeResponse
from recipe_scrapers import scrape_html
import requests

app = FastAPI()

@app.get("/")
def hello_world():
    return "hello world"

@app.post("/recipe/parse")
def root(request: ParseRecipeRequest) -> ParseRecipeResponse:
    url = request.source_url
    html = requests.get(url, headers={"User-Agent": f"Recipiece"}).content
    scraper = scrape_html(html, org_url=url)
    return scraper.to_json()
