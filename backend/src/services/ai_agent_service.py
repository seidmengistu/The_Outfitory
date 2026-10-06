from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from flask import g
from services import clothes_service, outfit_service
import json
import os
from dotenv import load_dotenv
from datetime import datetime
from langchain_community.chat_message_histories import SQLChatMessageHistory


try:
    from langchain_groq import ChatGroq
except Exception as exc:
    ChatGroq = None
    groq_import_error = exc

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b") 

if not GROQ_API_KEY:
    print(f"Groq: {GROQ_API_KEY}")
    raise RuntimeError("GROQ_API_KEY not found.")

LANGCHAIN_DB_STRING = "sqlite:///chat_memory.db"


def get_session_history(session_id: str):
    return SQLChatMessageHistory(
        session_id=session_id,
        connection=LANGCHAIN_DB_STRING,
        table_name="chat_history"
    )


# ---------- Tools for the model to communicate to the database (fetcg) ----------
@tool
def fetch_user_wardrobe_tool(season: str = "all", category: str = "all"):
    """
    Fetches the current user's wardrobe items from the database.
    Returns a JSON string list of items: {id, name, color, type}
    """
    try:
        user_id = g.current_user.get("decoded", {}).get("sub")
        wardrobe_data = clothes_service.get_all_clothes_of_user(user_id)
        if not wardrobe_data or "data" not in wardrobe_data:
            return "Error: Could not retrieve wardrobe data."
        items = wardrobe_data["data"]
        if len(items) == 0:
            return "No user data available."
        filtered_items = []
        for item in items:
            i_cat = str(item.get("category", "")).lower()
            if category == "all":
                cat_match = True
            else:
                category_normalized = category.lower().rstrip("s")
                cat_normalized = i_cat.rstrip("s")
                cat_match = (category_normalized == cat_normalized)
            if cat_match:
                filtered_items.append({
                    "id": item.get("cloth_id"),
                    "name": item.get("name"),
                    "color": item.get("color"),
                    "type": item.get("category")
                })
        if not filtered_items:
            return f"No items found in category: {category}."
        return json.dumps(filtered_items)
    except Exception as e:
        return f"System Error: {str(e)}"


tools = [fetch_user_wardrobe_tool]


# ---------- Pydantic models to for the model to return the structured result ----------
class Outfittem(BaseModel):
    item_id: int = Field(description="the database ID of the item")
    item_name: str = Field(description="the name of the item")
    styling_reason: str = Field(description="Short reason why this was picked")


class OutfitRecommendation(BaseModel):
    outfit_name: str = Field(description="a creative name for this look")
    selected_items: List[Outfittem] = Field(description="List of items making up the outfit")
    styling_tips: str = Field(description="Brief advice on how to wear this")


class OutfitItem(BaseModel):
    item_id: int
    item_name: str
    color: str
    type: str
    image_url: str
    occasion: str
    styling_reason: str


class EnrichedOutfit(BaseModel):
    outfit_id: Optional[str] = None
    outfit_name: str
    selected_items: List[OutfitItem]
    styling_tips: str
    created_at: str
    is_saved: bool
    validation_passed: bool
    error_message: Optional[str] = None


# Parser for model output
parser = PydanticOutputParser(pydantic_object=OutfitRecommendation)


# ---------- Service to consume the model, validate its output against whats in the db, save to db, and retry ----------
class OutfitRecommendationService:
    def __init__(self):
        self.parser = parser
        self.llm = self._setup_llm()
        self.agent = self._setup_agent()
        self.max_retries = 3

    def _setup_llm(self):
        return ChatGroq(model=GROQ_MODEL, api_key=GROQ_API_KEY, temperature=0.1, max_tokens=1024)

    def _setup_agent(self):
        system_prompt = PromptTemplate(
    input_variables=["input", "agent_scratchpad", "tool_names", "tools"], 
    template="""You are a professional Stylist AI Agent.

CRITICAL OUTFIT RULES - YOU MUST FOLLOW THESE:
1. ALWAYS fetch wardrobe items FIRST using the tool
2. A complete outfit MUST include:
   - At least ONE top (from 'tops' category)
   - At least ONE bottom (from 'bottom' category)
   - At least ONE shoe (from 'shoes' category)
   - And any other item categories if available
3. ONLY recommend items that were returned by the tool - NEVER make up items
4. NEVER suggest items like "White Linen Pants" if they don't exist in the wardrobe
5. Use the EXACT item names from the tool response
6. If a category is missing, fetch that category specifically

WARDROBE FETCHING STRATEGY:
- First: Fetch ALL items to see what's available
- Then: If needed, fetch specific categories (tops, bottom, shoes) to build complete outfit
- Finally: Select the best combination

YOU HAVE ACCESS TO THE FOLLOWING TOOLS:
{tools}

Use the following exact format (NO BRACKETS, NO EXTRA TEXT):

Question: the input question you must answer
Thought: I need to fetch the user's complete wardrobe first to see all available items
Action: the action to take, should be one of [{tool_names}]
Action Input: {{"season": "all", "category": "all"}}
Observation: [the items returned by the tool will go here]
Thought: Now I have the wardrobe items. I'll select at least one top, one bottom, and one shoe from the returned items to create a complete outfit
Final Answer: {{"outfit_name": "creative outfit name here", "selected_items": [{{"item_id": 8, "item_name": "Denin Jeans", "styling_reason": "perfect bottom for a casual date"}}, {{"item_id": 7, "item_name": "Leather Jacket", "styling_reason": "stylish top layer"}}, {{"item_id": 6, "item_name": "Sneakers bianche", "styling_reason": "comfortable shoes"}}], "styling_tips": "Pair these items for a casual yet stylish first date look"}}

CRITICAL FORMAT RULES:
- Action must be EXACTLY: fetch_user_wardrobe_tool (no brackets, no extra text)
- Action Input must be valid JSON: {{"season": "all", "category": "all"}}
- Final Answer must be valid JSON with real items from the tool response
- Item names must match EXACTLY what the tool returned
- Item IDs must match the "id" field from the tool response
- Never include items that weren't in the tool response
- Include items from multiple categories (tops, bottoms, shoes, etc.)

When you respond, output ONLY the Final Answer JSON.
Do NOT output: "Question:", "Thought:", "Action:", "Observation:", or anything else.
ONLY output the Final Answer JSON object.

BEGIN!

Question: {input}
Thought:{agent_scratchpad}"""
)
        agent = create_agent(
            model=self.llm,
            tools=tools,
            system_prompt=system_prompt.template
        )
        return agent

    def validate_and_enrich_outfit(self, outfit: OutfitRecommendation, user_id: int) -> tuple[bool, Optional[EnrichedOutfit], Dict]:
        try:
            wardrobe_response = clothes_service.get_all_clothes_of_user(user_id)
            if not wardrobe_response or "data" not in wardrobe_response:
                return False, None, {}
            wardrobe_items = wardrobe_response["data"]
            wardrobe_map = {item["cloth_id"]: item for item in wardrobe_items}
            invalid_items = []
            for outfit_item in outfit.selected_items:
                if outfit_item.item_id not in wardrobe_map:
                    invalid_items.append(f"Item ID {outfit_item.item_id} not found")
                else:
                    db_item = wardrobe_map[outfit_item.item_id]
                    if outfit_item.item_name.lower() != db_item["name"].lower():
                        invalid_items.append(f"Name mismatch: '{outfit_item.item_name}' vs '{db_item['name']}'")
            if invalid_items:
                return False, None, wardrobe_map
            enriched_items = []
            for outfit_item in outfit.selected_items:
                db_item = wardrobe_map[outfit_item.item_id]
                enriched_items.append(OutfitItem(
                    item_id=outfit_item.item_id,
                    item_name=outfit_item.item_name,
                    color=db_item.get("color", "N/A"),
                    type=db_item.get("category", "N/A"),
                    image_url=db_item.get("image_url", ""),
                    occasion=db_item.get("occasion", "casual"),
                    styling_reason=outfit_item.styling_reason
                ))
            enriched_outfit = EnrichedOutfit(
                outfit_name=outfit.outfit_name,
                selected_items=enriched_items,
                styling_tips=outfit.styling_tips,
                created_at=datetime.now().isoformat(),
                is_saved=False,
                validation_passed=True,
                error_message=None
            )
            return True, enriched_outfit, wardrobe_map
        except Exception as e:
            import traceback
            traceback.print_exc()
            return False, None, {}
        
    # --------- Save outfit to the db -----------
    def save_outfit(self, enriched_outfit: EnrichedOutfit, user_id: int) -> EnrichedOutfit:
        try:
            # outfit_data = {
            #     "user_id": user_id,
            #     "outfit_name": enriched_outfit.outfit_name,
            #     "items": [item.model_dump() for item in enriched_outfit.selected_items],
            #     "styling_tips": enriched_outfit.styling_tips,
            #     "created_at": enriched_outfit.created_at
            # }
            cloth_ids = [item.item_id for item in enriched_outfit.selected_items]
            outfit_data = {
                "user_id": user_id,
                "name": enriched_outfit.outfit_name,       # Map outfit_name -> name
                "description": enriched_outfit.styling_tips, # Map styling_tips -> description
                "clothes": cloth_ids                         # Map selected_items -> clothes (IDs only)
            }
            # TODO: actual DB save
            result = outfit_service.add_outfit(outfit_data)
            if result.get("code") == 201:
                new_id = result.get("data", {}).get("outfit_id")
                enriched_outfit.outfit_id = str(new_id)
                enriched_outfit.is_saved = True
            else:
                enriched_outfit.error_message = f"DB Error: {result.get('message')}"
                
            return enriched_outfit
        except Exception as e:
            enriched_outfit.error_message = f"Save failed: {str(e)}"
            return enriched_outfit
        
    # ------ Get outfit recommendations
    def get_recommendation(self, user_input: str, user_id: int) -> EnrichedOutfit:
        attempts = 0
        while attempts < self.max_retries:
            try:
                result = self.agent.invoke(
                    {"messages": [{"role": "user", "content": user_input}]}
                )
                messages = result.get("messages", [])
                if not messages:
                    raise ValueError("No messages returned from agent.")
                last_message = messages[-1]
                raw = getattr(last_message, "content", None) or last_message.get("content", "")
                parsed = self.parser.parse(raw)
            except Exception as e:
                return EnrichedOutfit(
                    outfit_name="Error",
                    selected_items=[],
                    styling_tips="",
                    created_at=datetime.now().isoformat(),
                    is_saved=False,
                    validation_passed=False,
                    error_message=f"Generation failed: {e}"
                )

            is_valid, enriched_outfit, wardrobe_map = self.validate_and_enrich_outfit(parsed, user_id)
            if is_valid and enriched_outfit:
                return enriched_outfit
            attempts += 1
            # Strict the model for only whats in the DB: modify user_input to include a hint to avoid hallucinations
            user_input = f"{user_input}. Use only items from the wardrobe (retry {attempts}/{self.max_retries})."

        return EnrichedOutfit(
            outfit_name="Error",
            selected_items=[],
            styling_tips="",
            created_at=datetime.now().isoformat(),
            is_saved=False,
            validation_passed=False,
            error_message=f"Could not generate a valid outfit after {self.max_retries} attempts"
        )

ai_recommendation_service = OutfitRecommendationService()


# def get_recommendation(user_input: str, user_id: int):
#     try:
#         enriched = ai_recommendation_service.get_recommendation(user_input, user_id)
#         return enriched.model_dump()
#     except Exception as e:
#         return {"error": str(e)}


# def save_recommendation(outfit_data: Dict[str, Any], user_id: int):
#     try:
#         enriched = EnrichedOutfit(**outfit_data)
#         saved = ai_recommendation_service.save_outfit(enriched, user_id)
#         return saved.model_dump()
#     except Exception as e:
#         return {"error": str(e)}