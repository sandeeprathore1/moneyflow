from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):
    @abstractmethod
    async def chat(self, messages: list[dict[str, str]], tools: list[dict] | None = None) -> str:
        pass


class MockAIProvider(AIProvider):
    async def chat(self, messages: list[dict[str, str]], tools: list[dict] | None = None) -> str:
        return "Based on your financial data, I can help analyze spending patterns. (Mock provider — set OPENAI_API_KEY for live responses.)"


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model

    async def chat(self, messages: list[dict[str, str]], tools: list[dict] | None = None) -> str:
        import httpx

        payload: dict[str, Any] = {"model": self.model, "messages": messages}
        if tools:
            payload["tools"] = tools
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]


def get_ai_provider(api_key: str | None, model: str) -> AIProvider:
    if api_key:
        return OpenAIProvider(api_key, model)
    return MockAIProvider()
