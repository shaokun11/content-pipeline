import { dbService } from "./db_services.js";

async function queryContent() {
  const response = await fetch('http://localhost:3000/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'PS3 pirated games',
    })
  });

  const data = await response.json();
  console.log(data.results)
}

function getById() {
  dbService.getById("463502569975849206").then(console.log)
}

getById();