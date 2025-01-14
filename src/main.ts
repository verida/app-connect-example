import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap'; // Import Bootstrap JavaScript
import $ from 'jquery';

const DEFAULT_SCOPES = ["api:ds-query", "api:llm-agent-prompt", "api:llm-profile-prompt", "api:search-universal", "ds:social-email"]

// Web Vault OAuth Endpoint
const AUTH_ENDPOINT = 'http://localhost:3000/oauth'

// This app
const RETURN_URL = "http://localhost:8080/"

// DCS API endpoint
const API_ENDPOINT = "https://localhost:5021/api/rest/v1"

// Optional: Specify a DID representing your application to display an icon and your application name
const REQUESTING_DID = undefined

let selectedScopes: string[] = []

function buildConnectUrl() {
  const redirectUrl = new URL(AUTH_ENDPOINT)
  for (const scope of selectedScopes) {
    redirectUrl.searchParams.append('scopes', scope)
  }

  redirectUrl.searchParams.append('redirectUrl', RETURN_URL)

  if (REQUESTING_DID) {
    redirectUrl.searchParams.append('scopes', REQUESTING_DID)
  }

  return redirectUrl.toString()
}

function populateScopes(scopes: any[]) {
  const container = $('#scopeContainer');
    container.html(''); // Clear any existing content

    let rowDiv = null;

    let i = 0
    for (const scope in scopes) {
      if (scope.match('base64')) {
        // skip base64 scopes
        continue
      }

      // Every even index (0, 2, 4, ...) starts a new row
      if (i++ % 2 === 0) {
        rowDiv = document.createElement('div');
        rowDiv.classList.add('row', 'mb-2'); // row with bottom margin
        container.append(rowDiv);
      }

      // Create a column for this option
      const colDiv = document.createElement('div');
      colDiv.classList.add('col-md-6'); // 2 columns per row

      // Create the .form-check wrapper
      const formCheck = document.createElement('div');
      formCheck.classList.add('form-check');

      // Create the checkbox input
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.classList.add('form-check-input');
      input.value = scope;
      input.id = 'option' + i;
      if (DEFAULT_SCOPES.indexOf(scope) !== -1) {
        input.checked = true
        selectedScopes.push(scope)
      }

      // Create the label
      const label = document.createElement('label');
      label.classList.add('form-check-label');
      label.htmlFor = 'option' + i;
      label.innerHTML = `${scope}<br/><span class="small">${scopes[scope].description}</span>`;

      // Put input + label inside .form-check, then into the column
      formCheck.appendChild(input);
      formCheck.appendChild(label);
      colDiv.appendChild(formCheck);

      // Finally, add the column to the row
      rowDiv!.appendChild(colDiv);
    }

    $('#checkboxContainer').on('change', 'input[type="checkbox"]', function() {
      if (this.checked) {
        // Add to array if not already included
        if (!selectedScopes.includes(this.value)) {
          selectedScopes.push(this.value);
        }
      } else {
        // Remove from array
        selectedScopes = selectedScopes.filter(val => val !== this.value);
      }

      $("#connect-url").html(buildConnectUrl())
    });
}

// Example usage
$('#connectButton').on('click', () => {
  window.location.href = buildConnectUrl()  
});

$(() => {
  const currentUrl = new URL(window.location.href)
  const authToken = currentUrl.searchParams.get("auth_token")

  if (authToken) {
    console.log('Have an auth token! Fetching some data')
    $("#connect").hide()
    $("#scopes").hide()
  
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
          content += `<p><span class="small" style="color: #9a9a9a">${item.schema}</span><br/>[${item._id}] ${item.name}</p>\n`
        }
        $('#response').html(`<h2>Server response</h2><p>Have an auth token in the query parameters so fetching some data:</p><div>${content}</div>`)
      }
    })
  } else {
    $.get({
      url: `${API_ENDPOINT}/auth/scopes`,
      success: (response) => {
        console.log(response)
        populateScopes(response.scopes)
        $("#connect-url").html(buildConnectUrl())
      }
    })
  }
})