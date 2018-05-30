
## Steps

### 1. Create (OAuth) Access token.

Without this, the rate limit of GitHub API (v3) is 60 per hour. There is no exact number for v4 but should be similar. 

One way is to create a OAuth app (server), then print the token information, ref: https://developer.github.com/apps/building-oauth-apps/

But a more convenient way is to get the token on GitHub Web UI, just follow the link,
https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/. In this step `Select the scopes, or permissions, you'd like to grant this token`, you do not need to select any scopes/permissions since this project is to read other people's public repositories' information.

### 2. run built index.js to use GitHub v4 GraphQL api to fetch data

1. Install TypeScript compilers. Ref: https://code.visualstudio.com/docs/languages/typescript
2. In project root folder, type `tsc` to get built JavaScript (index.ts->index.js) in build folder. Or you can use VS Code to build it. (Tasks->Run Build task)
3. execute `index.js`. Or you can use VS Code Debug to launch it. 

After a while, you will get `facebook-react.json` etc. 

### 3. Use Python geocoder package to identify each Stargazer's country

**Enable paid version of Google API**

[geocoder](https://github.com/DenisCarriere/geocoder) can use many [providers](https://github.com/DenisCarriere/geocoder#providers) and Google should be the best one. However there is a free quota to use Google API, [2500](https://developers.google.com/maps/documentation/geocoding/usage-limits) requests/day. Since our taget number exceeds this one. So I choose to enable the paid version of Google API. Finally I paid $2.3. 

**Get the Google API key**

ref: https://developers.google.com/maps/documentation/geocoding/get-api-key

Fill it in `.env` file, e.g.

```
GOOGLE_GEOCODE_API_KEY="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
```

**Execute the following Python script**

```python
from analysis import Analysis
cc = Analysis()
cc.append_countries()  
```

It will take many hours. Then you will get `facebook-react-country.json` etc.

### 4. Drow the bar charts. 

Run the following script, and it will show the chart result in a new browser tab.

```python
from analysis import Analysis
cc = Analysis()
cc.read_render(if_draw=True)   
```

## Why GitHub v3 API is not used

Since the response of the following v3 API used to get stargazers does not include location field. It only return the list of the stargazer account. We need to query each stargazer to get the location field. v4 GraphQL can let develoeprs to specifiy which fileds we need and get all the information in 1 request. 

```
https://api.github.com/
GET /repos/:owner/:repo/stargazers
```
