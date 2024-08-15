document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const highlightInput = document.getElementById("highlight");
  const apiKeyInput = document.getElementById("apiKey");
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");
  const matchedStringsList = document.getElementById("matchedStringsList");

  // Load stored data from localStorage on popup open
  const storedHighlight = localStorage.getItem("highlightText");
  const storedApiKey = localStorage.getItem("openaiApiKey");

  if (storedHighlight) {
      highlightInput.value = storedHighlight;
  }

  if (storedApiKey) {
      apiKeyInput.value = storedApiKey;
  }

  // Save textarea content and API key to localStorage when they change
  highlightInput.addEventListener("input", () => {
      localStorage.setItem("highlightText", highlightInput.value);
  });

  apiKeyInput.addEventListener("input", () => {
      localStorage.setItem("openaiApiKey", apiKeyInput.value);
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

      analyzeButton.addEventListener("click", async () => {
          chrome.tabs.sendMessage(
              tab.id,
              { action: "getDescription" },
              async (response) => {
                  if (chrome.runtime.lastError) {
                      console.error("Error sending message:", chrome.runtime.lastError);
                      return;
                  }

                  if (!response || !response.description) {
                      console.error("No description returned or response undefined:", response);
                      return;
                  }

                  const description = response.description;
                  const highlightText = highlightInput.value.trim();
                  const apiKey = apiKeyInput.value.trim();

                  console.log("Job Description:", description);

                  if (highlightText && apiKey) {
                      const matchedStrings = await analyzeDescription(
                          description,
                          highlightText,
                          apiKey
                      );

                      console.log('matchedStrings:', matchedStrings);

                      // Update the status icon based on whether matches were found
                      if (matchedStrings.length > 0) {
                          analyzeButton.classList.remove('success');
                          analyzeButton.classList.add('warning');
                          showModal(matchedStrings); // Show the modal with matched strings
                      } else {
                          analyzeButton.classList.remove('warning');
                          analyzeButton.classList.add('success');
                      }

                      // Highlight matched strings in the job description on the page
                      chrome.tabs.sendMessage(tab.id, {
                          action: "highlight",
                          matches: matchedStrings,
                      });
                  }
              }
          );
      });
  });

  // Function to show the modal with matched strings
  function showModal(matchedStrings) {
      matchedStringsList.innerHTML = ""; // Clear previous list items
      matchedStrings.forEach(match => {
          const li = document.createElement("li");
          li.textContent = match;
          matchedStringsList.appendChild(li);
      });
      modal.style.display = "block"; // Show the modal
  }

  // Close the modal when the user clicks on the close button
  closeModal.onclick = function() {
      modal.style.display = "none";
  };

  // Close the modal when the user clicks outside of the modal
  window.onclick = function(event) {
      if (event.target === modal) {
          modal.style.display = "none";
      }
  };
});

// Function to analyze the job description using OpenAI API
async function analyzeDescription(description, highlightText, apiKey) {
  try {
      const messages = [
          { role: "system", content: "You are a helpful assistant." },
          {
              role: "user",
              content: `
                  Please analyze this job description and return an array of exact text that matches the keywords provided.
                  Format the response as a JSON array of strings.
                  Job Description:
                  "${description}"
                  
                  Keywords:
                  "${highlightText}"
                  
                  Example Response Format: ["The job is hybrid", "Dutch language is a must", "salary is 50k"]
                  But only return the exact text from job description that matches the keywords.
              `,
          },
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              model: "gpt-4o-mini-2024-07-18",
              messages: messages,
              max_tokens: 300,
              temperature: 0.2,
          }),
      });

      const data = await response.json();
      console.log('data from OpenAi:', data);
      if (data.choices && data.choices.length > 0) {
          const content = data.choices[0].message.content;
          try {
              return JSON.parse(content.replace('```json', '').replace('```', '')); // Assuming OpenAI returns a JSON-formatted string
          } catch (e) {
              console.error("Failed to parse OpenAI response or validate schema:", content);
              return [];
          }
      }
      return [];
  } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return [];
  }
}