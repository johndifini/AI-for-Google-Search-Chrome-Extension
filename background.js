const OPENAI_API_KEY = 'your_openai_api_key_here';
const PERPLEXITY_API_KEY = 'your_perplexity_api_key_here';

// Keep track of processed URLs to avoid duplicate processing
const processedUrls = new Set();

// Listen for tab updates to detect back/forward navigation
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  // Remove old URLs from the set after some time to prevent memory bloat
  setTimeout(() => {
    processedUrls.delete(details.url);
  }, 300000); // Clear after 5 minutes
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.url.startsWith('https://www.google.com/search?q=')) {
    // Check if this URL has already been processed
    if (processedUrls.has(details.url)) {
      console.log('URL already processed, skipping:', details.url);
      return;
    }

    // Add URL to processed set
    processedUrls.add(details.url);
    
    const query = new URL(details.url).searchParams.get('q');
    console.log('Intercepted Google search:', query);

    Promise.all([
      fetchChatGPTResponse(query),
      fetchPerplexityResponse(query)
    ])
    .then(([chatGPTData, perplexityData]) => {
      console.log('ChatGPT Data:', chatGPTData);
      console.log('Perplexity Data:', perplexityData);
      
      chrome.storage.local.set({
        searchResults: {
          query,
          chatGPT: chatGPTData,
          perplexity: perplexityData
        }
      }, () => {
        console.log('Data saved to storage');
        if (chrome.runtime.lastError) {
          console.error('Error saving data:', chrome.runtime.lastError);
        }
        chrome.tabs.create({ url: 'results.html' }, (tab) => {
          console.log('Results tab created:', tab.id);
        });
      });
    })
    .catch(error => {
      console.error('Error in background script:', error);
      chrome.tabs.create({
        url: `error.html?message=${encodeURIComponent(error.message)}`
      });
    });
  }
}, { url: [{ urlPrefix: 'https://www.google.com/search?q=' }] });

function fetchChatGPTResponse(query) {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{"role": "system", "content": "You are an AI search engine. You are precise and concise."}, {"role": "user", "content": query}]
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('ChatGPT API response:', data);
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return {
        result: data.choices[0].message.content,
        model: data.model || 'gpt-4-mini'
      };
    } else {
      throw new Error('Unexpected response structure from ChatGPT API: ' + JSON.stringify(data));
    }
  });
}

function fetchPerplexityResponse(query) {
  return fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-chat",
      messages: [{"role": "system", "content": "Be precise and concise."}, {"role": "user", "content": query}]
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Perplexity API response:', data);
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return {
        result: data.choices[0].message.content,
        model: data.model || 'pplx-7b-online'
      };
    } else {
      throw new Error('Unexpected response structure from Perplexity API: ' + JSON.stringify(data));
    }
  })
  .catch(error => {
    console.error('Error in Perplexity API call:', error);
    return {
      result: `Error: ${error.message}`,
      model: 'Error'
    };
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'REPLICATE_ERROR') {
        console.error('Replicate API error:', request.error);
    }
    return true;
});

console.log('Background script loaded');
