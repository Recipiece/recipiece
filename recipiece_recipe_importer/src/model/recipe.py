from typing import List, Optional, Union
from pydantic import BaseModel

class ParseRecipeRequest(BaseModel):
    source_url: str
    use_wild_mode: bool


class ParseRecipeIngredientGroup(BaseModel):
    ingredients: List[str] = []
    purpose: Optional[str] = None


class ParsedIngredient(BaseModel):
    name: Optional[str]
    amount: Optional[str]
    unit: Optional[str]


class ParseRecipeResponse(BaseModel):
    author: Optional[str] = None
    description: Optional[str] = None
    ingredient_groups: List[ParseRecipeIngredientGroup] = []
    ingredients: Optional[List[str]] = []
    parsed_ingredients: Optional[List[ParsedIngredient]] = []
    instructions_list: Optional[List[str]] = []
    title: Optional[str] = None
    total_time: Optional[Union[str, int]] = None


class ParseIngredientsRequest(BaseModel):
    ingredients: List[str] = []


class ParseIngredientsResponse(BaseModel):
    ingredients: List[ParsedIngredient] = []
