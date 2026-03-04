<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/611111d4-9af4-46da-8efe-3e22dd807bc4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Configure GPT-5-Image (OpenRouter)

To use OpenAI's GPT-5-Image for image generation:

1. Go to **Settings** > **System Config** > **Connect My Wires**
2. Click **+ New Connection**
3. Select **Text** tab and configure:
   - **Provider**: OpenRouter
   - **Connection Name**: GPT-5-Image (or any name you prefer)
   - **Model**: `openai/gpt-5-image`
   - **API Key**: Your OpenRouter API key
   - **Base URL**: `https://openrouter.ai/api/v1` (pre-filled)
   - **Image Gen**: ✓ (Check this box - IMPORTANT!)
4. Click **Save**
5. Set as active by selecting it in the connections list

**Usage:**
- Send a message like "Generate a beautiful sunset over mountains"
- The model will return a base64 image that displays directly in the chat
- Images are rendered inline with proper styling
