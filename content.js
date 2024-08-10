function getJobDescription() {
    let description = "";
    const url = window.location.href;
  
    if (url.includes("linkedin.com")) {
      const element = document.querySelector(".jobs-details__main-content");
      if (element) {
        description = element.innerText;
      }
    } else if (url.includes("glassdoor.com")) {
      const element = document.querySelector('[class^="JobDetails_jobDetailsContainer"]');
      if (element) {
        description = element.innerText;
      }
    }
  
    return description;
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getDescription") {
      const description = getJobDescription();
      sendResponse({ description });
    }
  });