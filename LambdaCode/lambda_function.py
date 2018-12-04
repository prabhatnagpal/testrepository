import json

def lambda_handler(event, context):
    response = "Hello World"
    return {"statusCode": 200, "body": json.dumps(response)}
