/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
Amplify Params - DO NOT EDIT */
// DynamoDB Client
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')
const dBClient = new DynamoDBClient({
    region: process.env.AWS_REGION
})
const documentClient = DynamoDBDocument.from(dBClient)
// S3 Client
const { S3 } = require('@aws-sdk/client-s3')
const s3 = new S3()
// Import CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    // Get case_id from event
    const case_id = event.id
    // const case_data = await getCase(case_id)
    const filname = `csv-${case_id}`
    const TABLE_NAME = process.env.STORAGE_CASE_NAME
    const bucketName = 'locatingsurvivors-csv-prod'
    let body
    try {
        const case_data = await getCase(case_id)
        body = exportCase(case_data.Item)
        // make dynamoDB item a CSV
        await postCSV(bucketName, filname, body)

        return apiResponse(200, { message: 'Successfully uploaded' })



    } catch (error) {
        return apiResponse(500, { message: error.message })
    }




}
async function getCase(id) {

    const params = {
        TableName: process.env.STORAGE_CASE_NAME,
        Key: { id }
    }

    return documentClient.get(params)

}
async function postCSV(bucketName, key, body) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: 'text/csv'
    }
    return s3.putObject(params)
}
function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
}
function exportCase(caseData) {
    const header = Object.keys(caseData).join(',')

    const rows = []

    // Determine the maximum length among array fields
    const arrayLength = Math.max(
        ...Object.values(caseData).map(
            val => Array.isArray(val) ? val.length : 0
        )
    )

    // Create rows based on the array elements
    for (let i = 0; i < arrayLength; i++) {
        const row = []

        for (const key in caseData) {
            if (Array.isArray(caseData[key])) {
                row.push(caseData[key][i] !== undefined ? caseData[key][i] : '')
            } else {
                row.push(i === 0 ? caseData[key] : '')
            }
        }

        rows.push(row.join(','))
    }

    // Combine header and rows into CSV content
    const csvContent = `${header}\n${rows.join('\n')}`
    return csvContent
}