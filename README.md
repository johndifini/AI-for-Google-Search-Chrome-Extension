# AI for Google Search Chrome-Extension
Empower your Google searches with AI

## Overview

This Chrome extension intercepts Google searches and sends the query to OpenAI and Perplexity APIs. It then displays both responses in a new tab. This extension combines the power of Google Autocomplete with the intelligence of AI. It handles Google searches from Chrome's address bar and Google's search page.

## Features

- Intercepts Google search queries
- Sends queries to OpenAI (gpt-4o-mini) and Perplexity (llama-3.1-sonar-small-128k-chat)
- Displays both responses in a new tab

## Configuration and Installation

1. Before using the extension, you need to add your OpenAI and Perplexity API keys:
   1. Go to https://platform.openai.com/api-keys to obtain an OpenAI API key.
   2. Go to https://www.perplexity.ai/settings/api to obtain a Perplexity API key.
   1. Open the `background.js` file.
   1. Replace `'your_openai_api_key_here'` and `'your_perplexity_api_key_here'` with your actual API keys.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Perform a Google search as you usually would, either from google.com or your Chrome address bar.
2. The extension will intercept the search, send it to both AI models, and open a new tab with the results.

## Files

- `manifest.json`: Extension configuration file
- `background.js`: Handles search interception and API calls
- `results.html`: Template for displaying results
- `results.js`: Handles retrieving and displaying results
- `marked.min.js`: Markdown parsing library from https://marked.js.org/

## Contributing

Contributions to improve the extension are welcome. Please feel free to submit issues or pull requests.
