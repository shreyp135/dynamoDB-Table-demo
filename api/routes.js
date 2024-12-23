import express from 'express';
import aws from 'aws-sdk';

const router = express.Router();
aws.config.update({ region: process.env.AWS_REGION || 'eu-north-1' });

const dynamodb = new aws.DynamoDB.DocumentClient();

//to get sequencial id
const getId = async ()=> {
    try{
        const params = {TableName: "idCounter",
            Key: {id: "BusinessId"}, 
                UpdateExpression: "set idCount = idCount + :val",
                ExpressionAttributeValues: {
                    ":val": 1
                },
                ReturnValues: "UPDATED_NEW"
            };
            const data = await dynamodb.update(params).promise();  
            const idval = data.Attributes.idCount;
            return `Business_${idval.toString().padStart(3, '0')}`;
            } catch (error) {
                console.error(error);
                
            }
}; 

//to get all businesses
router.get('/', async (req, res) => {
    try {
        const params = { TableName: "Businesses"};
        const data = await dynamodb.scan(params).promise();
        console.log(data);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch data' });
    }
});

//to create a new business
router.post('/', async (req, res) => {
    try {
        const {name, status} = req.body;
        const id = await getId();
        const params = {
            TableName: "Businesses",
            Item: {
                busId: id,
                name: name,
                createdAt: new Date().toISOString(),
                status: status
            }
        };
        await dynamodb.put(params).promise();
        res.status(200).json({  success: 'Successfully added business', business: params.Item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not add business' });
    }
});

//delete a business by id
router.delete('/:id', async (req, res) => {
    try {
        const busId = req.params.id;
        const params = {
            TableName: "Businesses",
            Key: { busId }
        };
        await dynamodb.delete(params).promise();
        res.status(200).json({ success: 'Successfully deleted business' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete business' });
    }
});




export default router;