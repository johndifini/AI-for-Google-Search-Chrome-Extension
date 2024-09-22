document.addEventListener('DOMContentLoaded', function() {
    console.log('Results page loaded');
    
    chrome.storage.local.get('searchResults', (data) => {
        console.log('Retrieved data from storage:', data);
        
        if (data.searchResults) {
            const { query, chatGPT, perplexity } = data.searchResults;
            
            console.log('Query:', query);
            console.log('ChatGPT data:', chatGPT);
            console.log('Perplexity data:', perplexity);
            
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
                
                displayMarkdownResult(chatgptResultElement, chatGPT.result);
                displayMarkdownResult(perplexityResultElement, perplexity.result);
            } else {
                console.error('Error: Could not find required elements');
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

function displayMarkdownResult(element, result) {
    if (result) {
        try {
            element.innerHTML = marked.parse(result);
            console.log('Markdown parsed and displayed');
        } catch (error) {
            console.error('Error parsing result:', error);
            element.textContent = 'Error displaying result';
        }
    } else {
        console.warn('No result available for display');
        element.textContent = 'No result available';
    }
}