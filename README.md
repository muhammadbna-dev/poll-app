# Setup
1. Ensure docker is setup on the local machine
2. Run `docker-compose build` to build dependencies
3. Run `docker-compose up`
4. Setup sample poll in DB

```
curl --location 'http://localhost:8080/api/poll' \
--header 'Content-Type: application/json' \
--data '{
    "name": "foo",
    "questions": [
        {
            "text": "TypeScript is better than JavaScript",
            "options": [
                {
                    "text": "Yes"
                },
                {
                    "text": "No"
                }
            ]
        }
    ]
}'
```

# Implementation context
1. MongoDB is considered over SQL given that we can build something quickly, easier to visualize the poll app data using JSON while still have basic db operations and an aggregation function
2. When a user enters the app, and selects an option from the question poll, a random session ID is generated on the frontend and stored as local storage and used to save the result in DB. We store the session ID in the frontend such that the user that already has voted for the poll, cannot vote again. Moreover, the session ID is helpful to be stored in the DB with the result so that we can have a backend check to prevent the user from voting twice.
3. We are using a simple polling for this feature to simulate a refresh of the results. Websocket implementation was considered but it might be overkill for this feature given that websocket is perfect for bi-directional communication but given that after the user polls and is just interested in viewing the results, polling will suffice unless there is further interactivity on the user's end to warrant a websocket implementation
4. To mitigate the chance of a race condition, we can use the mongodb constraint on the results collection to ensure that the user can only answer a question once. This is not implemented yet but this is considered. A preferred method would to implement a queue alongside the db constraint mentioned
