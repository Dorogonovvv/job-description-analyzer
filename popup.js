document.addEventListener("DOMContentLoaded", () => {
    const analyzeButton = document.getElementById("analyzeButton");
    const highlightInput = document.getElementById("highlight");
  
    // Load stored data from localStorage on popup open
    const storedHighlight = localStorage.getItem('highlightText');
    if (storedHighlight) {
      highlightInput.value = storedHighlight;
    }
  
    // Save textarea content to localStorage when it changes
    highlightInput.addEventListener('input', () => {
      localStorage.setItem('highlightText', highlightInput.value);
    });
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const url = tab.url;
  
      // Enable the button if the current tab's URL matches LinkedIn or Glassdoor job pages
      if (
        url.includes("linkedin.com/jobs/") ||
        url.includes("glassdoor.com/Job/")
      ) {
        analyzeButton.disabled = false;
      }
  
      analyzeButton.addEventListener("click", () => {
        chrome.tabs.sendMessage(tab.id, { action: "getDescription" }, (response) => {
          const description = response.description;
          const highlightText = highlightInput.value.trim();
  
          console.log("Job Description:", description);
  
          if (highlightText) {
            console.log("Highlight these terms:", highlightText.split(',').map(term => term.trim()));
            // Implement further logic to highlight specific terms
            // For example, use the highlightText to search and highlight in the description
          }
        });
      });
    });
  });