export default {
    // ref: https://developer.github.com/v4/object/user/
    // after: Returns the elements in the list that come after the specified global ID.
    queryStargazers: ({ owner, name, after }) => `
      query {
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
        repository(owner:"${owner}", name: "${name}") {
          stargazers(first: 100${after ? `, after: "${after}"` : ''}) {
            totalCount
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
            edges {
              starredAt
            }
            nodes {
              login
              location
            }
          }
        }
      }
    `,
  }