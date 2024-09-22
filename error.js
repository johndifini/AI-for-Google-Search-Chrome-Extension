        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const errorMessage = urlParams.get('message');
            const errorElement = document.getElementById('error-message');
            if (errorElement) {
                errorElement.textContent = errorMessage || 'An unknown error occurred.';
            } else {
                console.error('Error: Could not find element with id "error-message"');
            }
        });
