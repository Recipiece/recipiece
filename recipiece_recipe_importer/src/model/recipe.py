from typing import List, Optional, Union
from pydantic import BaseModel

class ParseRecipeRequest(BaseModel):
    source_url: str


class ParseRecipeIngredientGroup(BaseModel):
    ingredients: List[str] = []
    purpose: Optional[str] = None

class ParseRecipeResponse(BaseModel):
    author: Optional[str] = None
    description: Optional[str] = None
    ingredient_groups: List[ParseRecipeIngredientGroup] = []
    ingredients: Optional[List[str]] = []
    instructions_list: Optional[List[str]] = []
    title: Optional[str] = None
    total_time: Optional[Union[str, int]] = None
