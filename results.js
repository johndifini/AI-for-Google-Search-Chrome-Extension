const REPLICATE_API_KEY = 'your_replicate_api_key_here';

document.addEventListener('DOMContentLoaded', function() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const imageEl = document.getElementById('generated-image');
    
    function showLoading(show) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
    
    function showError(message) {
        errorEl.textContent = message;
        errorEl.style.display = message ? 'block' : 'none';
    }
    
    function showImage(url) {
        imageEl.src = url;
        imageEl.style.display = 'block';
    }

async function generateImage(query) {
    showLoading(true);
    showError('');
    imageEl.style.display = 'none';
    
    try {
        console.log('Generating image for query:', query);
        
        // Initialize image generation with Flux-Schnell model
        const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`, 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: {
                    prompt: query + ", funny",
                    //negative_prompt: "ugly, unsightly, poorly drawn, caption, text, watermark, signature",
                    num_inference_steps: 4,
                    guidance_scale: 20,
                    width: 768,
                    height: 768,
                    aesthetic_score: 6,
                    negative_aesthetic_score: 2.5
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Replicate API error:', errorData);
            throw new Error(`API error: ${errorData.detail || response.statusText}`);
        }

        const prediction = await response.json();
        console.log('Prediction started:', prediction);

        if (!prediction.id) {
            throw new Error('No prediction ID received from API');
        }

        const imageUrl = await pollForResult(prediction.id);
        console.log('Generated image URL:', imageUrl);
        showImage(imageUrl);
    } catch (err) {
        console.error('Image generation error:', err);
        showError('Failed to generate image: ' + err.message);
    } finally {
        showLoading(false);
    }
}

async function pollForResult(predictionId) {
    const maxAttempts = 60;
    const delayMs = 1000;
    
    console.log('Starting to poll for prediction:', predictionId);
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                    headers: {
                        'Authorization': `Token ${REPLICATE_API_KEY}`, 
                    },
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Polling error:', errorData);
                throw new Error(`Polling error: ${errorData.detail || response.statusText}`);
            }
            
            const prediction = await response.json();
            console.log('Polling response:', prediction);
            
            if (prediction.status === 'succeeded') {
                if (prediction.output && prediction.output.length > 0) {
                    return prediction.output[0];
                }
                throw new Error('No output in successful prediction');
            } else if (prediction.status === 'failed') {
                throw new Error(prediction.error || 'Image generation failed');
            } else if (prediction.status === 'canceled') {
                throw new Error('Image generation was canceled');
            }
            
            console.log(`Attempt ${i + 1}/${maxAttempts}: Status is ${prediction.status}`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        } catch (err) {
            console.error(`Polling attempt ${i + 1} failed:`, err);
            throw err;
        }
    }
    
    throw new Error('Timeout waiting for image generation');
}

    // Handle search results
    chrome.storage.local.get('searchResults', (data) => {
        console.log('Retrieved data from storage:', data);
        
        if (data.searchResults) {
            const { query, chatGPT, perplexity } = data.searchResults;
            
            // Display search results
            const queryElement = document.getElementById('query');
            const chatgptResultElement = document.getElementById('chatgpt-result');
            const perplexityResultElement = document.getElementById('perplexity-result');
            const chatgptModelElement = document.getElementById('chatgpt-model');
            const perplexityModelElement = document.getElementById('perplexity-model');
            
            if (queryElement && chatgptResultElement && perplexityResultElement && 
                chatgptModelElement && perplexityModelElement) {
                queryElement.textContent = query || 'No query provided';
                chatgptModelElement.textContent = chatGPT.model || 'Unknown';
                perplexityModelElement.textContent = perplexity.model || 'Unknown';
                
                chatgptResultElement.innerHTML = marked.parse(chatGPT.result || '');
                perplexityResultElement.innerHTML = marked.parse(perplexity.result || '');
                
                // Generate image based on query
                generateImage(query);
            }

            // Clear the data after retrieving it
            chrome.storage.local.remove('searchResults', () => {
                console.log('Search results removed from storage');
                if (chrome.runtime.lastError) {
                    console.error('Error removing data:', chrome.runtime.lastError);
                }
            });
        } else {
            console.error('No search results found in storage');
            document.body.innerHTML = '<h1>Error: No search results found</h1>';
        }
    });
});
