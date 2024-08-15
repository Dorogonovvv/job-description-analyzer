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
  
  function highlightText(matches) {
    console.log("Highlighting text...");
    const url = window.location.href;
    let container;
  
    if (url.includes("linkedin.com")) {
      container = document.querySelector(".jobs-details__main-content");
    } else if (url.includes("glassdoor.com")) {
      container = document.querySelector('[class^="JobDetails_jobDetailsContainer"]');
    }
  
    if (container && matches.length > 0) {
      matches.forEach(match => {
        console.log(`Wrapping match: ${match}`);
        const regex = new RegExp(`(${match})`, "gi");
        container.innerHTML = container.innerHTML.replace(regex, `<span style="background-color: darkorange; color: white;">$1</span>`);
      });
    }
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received in content.js:", request);
    if (request.action === "getDescription") {
      const description = getJobDescription();
      sendResponse({ description });
    }
  
    if (request.action === "highlight") {
      highlightText(request.matches);
    }
  });