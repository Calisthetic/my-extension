import { getActiveTabURL } from "./utils.js";

let pagesCount = 0

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  //const queryParameters = activeTab.url.split("?")[1];
  //const urlParameters = new URLSearchParams(queryParameters);
  //const currentVideo = urlParameters.get("v");

  await initializeFirstPage();
  
  if (activeTab.url.includes("wordlegame.org")) {
    await initializeWordlePage()
  } else {
    
  }
  refreshPagination()
});

const initializeFirstPage = async () => {
  const page = createPage("id" + pagesCount)
  const header = document.createElement("h2")
  header.innerText = "Hello, kitty!"
  header.style.color = "#ff00ff"
  page.appendChild(header)
  addPage(page)
}

const initializeWordlePage = async () => {
  const page = createPage("page" + pagesCount)
  const h2 = document.createElement("h2")
  h2.innerText = "Wordle helper"
  const helpOnceButton = createButton("Help me", "btn-help-once")
  const helpFullButton = createButton("Solve it", "btn-help-full")
  helpFullButton.style.marginTop = "8px"
  helpOnceButton.addEventListener("click", async () => {
    const activeTab = await getActiveTabURL();
    chrome.tabs.sendMessage(activeTab.id, {
      type: "POST",
      value: "once",
    }, function(response) {
      console.log(response);
    });
  })
  helpFullButton.addEventListener("click", async () => {
    const activeTab = await getActiveTabURL();
    chrome.tabs.sendMessage(activeTab.id, {
      type: "POST",
      value: "full",
    }, function(response) {
      console.log(response);
    });
  })
  
  page.appendChild(h2)
  page.appendChild(helpOnceButton)
  page.appendChild(helpFullButton)
  addPage(page)
}

const createPage = (id) => {
  const elem = document.createElement("ul")
  elem.classList.add("list")
  elem.id = id

  return elem
}
const createButton = (text, id) => {
  const elem = document.createElement("button")
  elem.classList.add("default-button")
  const span = document.createElement("span")
  span.innerText = text
  elem.appendChild(span)
  elem.id = id

  return elem
}

const addPage = (pageElem) => {
  const pages = document.getElementById("pages")
  if (!pages) {
    return
  }
  pages.appendChild(pageElem)
  pagesCount++
}

const refreshPagination = () => {
  const pagination = document.getElementById("pagination")
  if (!pagination) {
    return
  }

  let html = '<span class="page-btn page-step" data-shown="1">&laquo;</span>'
  for (let i = 1; i < pagesCount; i++) {
    html+='<a href="#page-' + i + '" class="page-btn page-step" data-shown="' + (i + 1) + '">&laquo;</a>'
  }
  for (let i = 0; i < pagesCount; i++) {
    html+='<a href="#page-' + (i + 1) + '" id="page-' + (i + 1) + '" class="page-btn">' + (i + 1) + '</a>'
  }
  for (let i = 0; i < pagesCount - 1; i++) {
    html+='<a href="#page-' + (i + 2) + '" class="page-btn page-step" data-shown="' + (i + 1) + '">&raquo;</a>'
  }
  html+='<span class="page-btn page-step" data-shown="' + pagesCount + '">&raquo;</span>'

  pagination.innerHTML = html;
}

