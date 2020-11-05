// Requires
const axios = require('axios').default
const base64 = require('base-64')
const utf8 = require('utf8')
const fs = require('fs')
const qs = require('qs')

// Envars
const CLIENT_ID = process.env.CMNSRV_CLIENTID
const CLIENT_SECRET = process.env.CMNSRV_CLIENTSECRET
const TOKEN_URL = process.env.COMMON_DOCGEN_SSO_ENDPOINT

// Get token
function get_docgen_token() {
    const params = qs.stringify({
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": ""
    })

    const header = qs.stringify({
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    return new Promise(resolve => {
        axios
            .post(TOKEN_URL, params, header)
            .then(res => {
                resolve(res.data.access_token)
            })
            .catch(error => {
                console.error(error)
            })
    })
}


// Accepts a data dict and a path to an xlsx template and makes a request to CDOGS.
// Returns the response content object that can be added to a starlette.responses.Response.
async function docgen_export_to_xlsx(data, template_path, report_name) {

    // Get auth token and prepare it as an Authorization: Bearer <token> header.
    const token = await get_docgen_token()

    // Open up the Excel template, and base64 encode it for the docgen endpoint
    const template_data = fs.readFileSync(template_path, 'utf8')
    const bytes = utf8.encode(template_data)
    const base64_encoded = base64.encode(bytes)

    // The docgen endpoint accepts the following schema:
    const body = qs.stringify({
        "data": data,
        "options": {
            "reportName": report_name,
        },
        "template": {
            "encodingType": "base64",
            "content": base64_encoded,
            "fileType": "xlsx"
        }
    })
}
docgen_export_to_xlsx("a", './src/assets/templates/CEM_template.xlsx', "c")
