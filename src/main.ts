import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap'; // Import Bootstrap JavaScript
import $ from 'jquery';

const REQUESTED_SCOPES = ["api:ds-query", "api:llm-agent-prompt", "api:llm-profile-prompt", "api:search-universal", "ds:social-email"]

// Web Vault OAuth Endpoint
const AUTH_ENDPOINT = 'http://localhost:3000/oauth'

// This app
const RETURN_URL = "http://localhost:8080/"

// DCS API endpoint
const API_ENDPOINT = "https://localhost:5021/api/rest/v1"

// Optional: Specify a DID representing your application to display an icon and your application name
const REQUESTING_DID = undefined

// Example usage
$('#connectButton').on('click', () => {
  const redirectUrl = new URL(AUTH_ENDPOINT)
  for (const scope of REQUESTED_SCOPES) {
    redirectUrl.searchParams.append('scopes', scope)
  }

  redirectUrl.searchParams.append('redirectUrl', RETURN_URL)

  if (REQUESTING_DID) {
    redirectUrl.searchParams.append('scopes', REQUESTING_DID)
  }

  const finalUrl = redirectUrl.toString()
  window.location.href = finalUrl
  
});

$(() => {
  const currentUrl = new URL(window.location.href)
  const authToken = currentUrl.searchParams.get("auth_token")

  if (authToken) {
    console.log('have an auth token!')
  }
  
  // perform a universal search
  $.get({
    url: `${API_ENDPOINT}/search/universal?keywords=meeting+agenda`,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    success: (response) => {
      let content = ""
      console.log(response)
      for (const item of response.items) {
        content += `[${item._id}] ${item.name} (${item.schema})\n`
      }
      $('#content').html(`<h2>Server response</h2><pre>${content}</pre>`)
    }
  })
})