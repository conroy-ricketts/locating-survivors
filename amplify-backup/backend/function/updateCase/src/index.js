/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')
const dBClient = new DynamoDBClient({
    region: process.env.AWS_REGION
})
const documentClient = DynamoDBDocument.from(dBClient)

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}

exports.handler = async (event) => {



    let item = getItemFromBody(event)
    const id = item.ID
    const latitude = item.Latitude
    const longitude = item.Longitude
    const uncertainty = item.Uncertainty
    const time = item.Time


    try {

        const getCaseParams = {
            TableName: process.env.STORAGE_CASE_NAME,
            Key: {
                id: id
            }
        }




        const getData = await documentClient.get(getCaseParams)
        const getTimePosted = new Date(getData.Item.time_posted)
        const currentTime = new Date()
        const timeDifferenceMs = currentTime - getTimePosted
        const totalMinutes = Math.round(timeDifferenceMs / (1000 * 60))
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`


        const getVersion = getData.Item._version



        const updateParams = {
            TableName: process.env.STORAGE_CASE_NAME,
            Key: {
                id: id
            },
            UpdateExpression: `SET #latitudes = list_append(if_not_exists(#latitudes, :empty_list), :latitude), 
            #longitudes = list_append(if_not_exists(#longitudes, :empty_list), :longitude),
            #uncertainties = list_append(if_not_exists(#uncertainties, :empty_list), :uncertainty), 
            #times = list_append(if_not_exists(#times, :empty_list), :time), 
            #duration = list_append(if_not_exists(#duration, :empty_list), :duration), 
            #time_updated = :time_updated, 
            #next_update = :next_update, 
            #version = :version, 
            #lastChangedAt = :lastChangedAt,
            #status = :status`,
            ExpressionAttributeNames: {
                '#latitudes': 'latitude',
                '#longitudes': 'longitude',
                '#uncertainties': 'uncertainty',
                '#times': 'time',
                '#duration': 'duration',
                '#time_updated': 'time_updated',
                '#next_update': 'next_update',
                '#version': '_version',
                '#lastChangedAt': '_lastChangedAt',
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':latitude': [latitude],
                ':longitude': [longitude],
                ':uncertainty': [uncertainty],
                ':time': [time],
                ':empty_list': [],
                ':duration': [formattedTime],
                ':time_updated': new Date().toISOString(),
                ':next_update': addMinutes(new Date(), 15).toISOString(),
                ':version': getVersion + 1,
                ':lastChangedAt': new Date().getTime(),
                ':status': 'Open'
            }

        }



        await documentClient.update(updateParams)
        console.log('updated')
        return apiResponse(200, 'Success')




    } catch (error) {
        console.log(error)
        return apiResponse(400, { message: error.message })

    }

}


function getItemFromBody(body) {

    let item = {}

    Object.keys(body).forEach(key => {
        item[key] = body[key]
    })

    return item

}

function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
}
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000)
}
