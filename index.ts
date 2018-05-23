import * as fs from "fs";
import fetch from 'node-fetch';
import * as dotenv from 'dotenv'
dotenv.config();

import documents from './documents';
const GRAPHQL_URL = 'https://api.github.com/graphql';

const MY_STATUS = {
  NET_ERROR: 499,
  GRAPHQL_ERROR: 599,
};

// ref: https://github.com/entronad/gitview/blob/master/src/api/index.js
const createCall = async (document, accessToken) => {
  const payload = JSON.stringify({
    query: document,
  });
  let response; 
  try {
    response = await fetch(
      GRAPHQL_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `bearer ${accessToken}`,
        },
        body: payload,
      }
    );
  } catch (e) {
    return {
      status: MY_STATUS.NET_ERROR,
      ok: false,
      // body: {
      message: e.message,
      // },
    };
  }
  let body;
  try {
    body = await response.json();
  } catch (e) {
    return {
      status: MY_STATUS.NET_ERROR,
      ok: response.ok,
      // body: {
      message: e.message,
      // },
    };
  }
  if (!response.ok) {
    return {
      status: response.status,
      ok: response.ok,
      // body: {
      message: body.message,
      // }
    };
  }
  return body.data
    ? {
      status: response.status,
      ok: response.ok,
      data: body.data,
    }
    : {
      status: MY_STATUS.GRAPHQL_ERROR,
      ok: false,
      // body: {
      message: body.errors[0].message
      // }
    };
}

const queryStargazers = async (owner, name, accessToken) => {

  let cursor = "";
  let stop = false;
  let runTimes = 0; 
  const maximalTryPages = 1000;
  let totalStargazers = 0;
  let locationStargazerList = [];

  while(!stop && runTimes<maximalTryPages) {
    // console.log("start query");
    const resp = await createCall(documents.queryStargazers({ owner, name, after:cursor }), accessToken)
    // console.log("end query");
  
    if (resp.ok && resp.data)  {
      const {rateLimit, repository } = resp.data

      if (rateLimit) {
        if (runTimes%100===0) {
          // const {cost, limit, remaining, resetAt} = rateLimit;
          console.log("limit:", rateLimit);
        }
      }

      if (!repository || !repository.stargazers) {
        console.log("no repository or stargazers")
        break;         
      }    
      const {totalCount, pageInfo, nodes} = repository.stargazers;
      if (!pageInfo || !nodes || !totalCount) {
        console.log("no enough repo stargazers info. ")
        break;         
      }
      totalStargazers = totalCount;

      for (const node of nodes) {
        // console.log("star user:", node.login);
        if (node.location) {
          locationStargazerList.push(node);
        }
      }

      if (pageInfo && pageInfo.hasNextPage) {
        cursor = pageInfo.endCursor;
      } else {
        stop = true; 
      }
    }

    runTimes++;
  }

  console.log("final cursor:", cursor);
  console.log("runTimes:", runTimes);

  return {locationStargazerList, totalStargazers};
};

(async () => {
  const accessToken = process.env.accessToken;
  if (!accessToken) {
    console.log("no accessToken, please specify it in .env, e.g. accessToke=xxx");
    return
  }

  let owner, name, result;
  
  for (let i=0; i<2; i++) {
    if (i === 0) {
      owner = "vuejs"; 
      name = "vue"; 
    } else if (i === 1) {
      owner = "facebook"; 
      name = "react";  
    } else {
      owner = "angular"; 
      name = "angular";  
    }

    console.log("start query");
    result = await queryStargazers(owner, name, accessToken);
    console.log("end query");
    console.log("locationUsers:", result.locationStargazerList.length);
    console.log("total Stargazers :", result.totalStargazers);
    fs.writeFile(owner+"-"+name+".json", JSON.stringify(result, null, 2), (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
    
  }
})();
