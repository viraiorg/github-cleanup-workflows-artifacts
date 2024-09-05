var figlet = require("figlet");
const prompt = require('prompt-sync')({sigint: true});


const owner="<YOUR_ORGANIZATION_NAME>"
const token="<YOUR_TOKEN>"
const headers= {
  "Accept": "application/vnd.github+json",
  "Authorization": "Bearer " + token,
  "X-GitHub-Api-Version": "2022-11-28"
}

async function getOrgRepos(){
  console.log("[info] getting repos of %s org", owner);
  var pageIndex = 1;
  var pageSize = 30;
  var repos = [];

  do {
    var url = "https://api.github.com/orgs/" + owner + "/repos?per_page=" + pageSize + "&page=" + pageIndex;
    var page = [];
    try {
      const response = await fetch(url, { method: "GET", headers: headers });
      if (!response.ok) {
        const responseError = await response.text();
        throw new Error(`\n[error] get repos error:\n${responseError}\n`);
      }
      page = await response.json();
    } catch (error) {
      console.error(error.message);
    }
    
    for (var j = 0; j < page.length; j++){
      repos.push(page[j].name);
    }

    pageIndex++;
  } while (page.length >= pageSize);
  return repos;
}

async function getRepoArtifacts(repo) {
  console.log("[info] getting artifacts of %s repo", repo);
  var pageIndex = 1;
  var pageSize = 30;
  var artifacts = [];

  do {
    var url = "https://api.github.com/repos/" + owner + "/" + repo + "/actions/artifacts?per_page=" + pageSize + "&page=" + pageIndex;
    var page = [];
    try {
      const response = await fetch(url, { method: "GET", headers: headers });
      if (!response.ok) {
        const responseError = await response.text();
        throw new Error(`\n[error] get repo artifacts error:\n${responseError}\n`);
      }
      page = await response.json();
      //console.log("artifacts: " + page.artifacts.length);
    } catch (error) {
      console.error(error.message);
    }

    artifacts = artifacts.concat(page.artifacts);
    pageIndex++;
  } while (page.artifacts.length >= pageSize);
  return artifacts;
}


async function deleteArtifact(repo, artifactId){
  var url = "https://api.github.com/repos/" + owner + "/" + repo + "/actions/artifacts/" + artifactId
  try {
    var response = await fetch(url, { method: "DELETE", headers: headers });
    if (!response.ok) {
      const responseError = await response.text();
      throw new Error(`\n[error] delete artifact error:\n${responseError}\n`);
    }
    response = await response;
    //console.log("response: " + response.status);
  } catch (error) {
    console.error(error.message);
  }
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


async function main() {
  await delay(1000);
  console.log(
    figlet.textSync(owner, {
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    })
  );
  console.log("This util is going to delete all actions artifacts expired and created more than one day ago.\n");
  await delay(5000);

  var repos = await getOrgRepos();
  //console.log("repos: " + repos);

  chunkLoop: for (let i = 0; i < repos.length; i++) { 
    var artifacts = await getRepoArtifacts(repos[i]);
    console.log("[info] %d artifacts to delete of repo %s", artifacts.length, repos[i]);

    if(artifacts.length > 0 ){
      var proceed = prompt("[heads up] "+artifacts.length+" artifacts of repo "+repos[i]+" are going to be deleted, continue? yes/no >");
      if (proceed === "yes") {} else { console.log("[info] exiting"); continue chunkLoop; }

      for (let j = 0; j < artifacts.length; j++) { 
        
        var oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));
        var artifactCreatedAt = new Date(artifacts[j].created_at);

          if(artifacts[j].expired == true && artifactCreatedAt < oneDayAgo){
            console.log("[info] artifact [ %s ] with id [ %s ] is expired and was created more than one day ago, deleting...", artifacts[j].name, artifacts[j].id)
            await deleteArtifact(repos[i], artifacts[j].id);
            //break;
          }
      }
    }

  }
   
}


main();