import unittest
from unittest.mock import MagicMock, patch, AsyncMock
import sys
from pathlib import Path

# Add src to path
src_path = str(Path(__file__).parents[1] / "src")
print(f"DEBUG: Adding {src_path} to sys.path")
sys.path.insert(0, src_path)
print(f"DEBUG: sys.path[0] is {sys.path[0]}")

from digipin_agent.agent import GeminiDigipinAgent

class TestGeminiDigipinAgent(unittest.IsolatedAsyncioTestCase):
    @patch("digipin_agent.agent.HarmBlockThreshold", create=True)
    @patch("digipin_agent.agent.HarmCategory", create=True)
    @patch("digipin_agent.agent.genai")
    def setUp(self, mock_genai, mock_harm_category, mock_harm_block_threshold):
        self.mock_genai = mock_genai
        self.mock_model = MagicMock()
        self.mock_genai.GenerativeModel.return_value = self.mock_model
        
        # Mock the chat session
        self.mock_chat = MagicMock()
        self.mock_model.start_chat.return_value = self.mock_chat
        
        self.agent = GeminiDigipinAgent(api_key="test_key")

    async def test_respond_success(self):
        # Mock the response from send_message
        mock_response = MagicMock()
        mock_response.text = "The coordinates for 88-88-88 are 12.34, 56.78"
        # Ensure candidates is empty so it falls back to .text
        mock_response.candidates = []
        self.mock_chat.send_message.return_value = mock_response

        response = await self.agent.respond("Where is 88-88-88?")
        
        self.assertEqual(response["response"], "The coordinates for 88-88-88 are 12.34, 56.78")
        self.mock_chat.send_message.assert_called()

    async def test_respond_error(self):
        # Mock an exception during send_message
        self.mock_chat.send_message.side_effect = Exception("API Error")

        with self.assertRaises(Exception) as cm:
            await self.agent.respond("Where is 88-88-88?")
        
        self.assertEqual(str(cm.exception), "API Error")

if __name__ == "__main__":
    unittest.main()
