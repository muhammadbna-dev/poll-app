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

# V2 Implementation context

# V2

## Features
Users are able to:
1. Detect users count viewing each individual question. When user scrolls away from the question, the user count for that question is decremented. If the user closes the tab/window, the user count for the questions that the user was previously viewing is decremented as well.
2. Able to answer multiple questions. When user answer a question, they cannot answer the question. Handled on the db and frontend level
3. Able to see results in real time per question

## Implementation context
1. We are using an object in the backend, to store the user sessions (in a Set to store unique sessions) that are currently viewing each question. The browser polls the server to always get the updated user session count for each question
2. We are using an IntersectionObserver in the frontend which attaches an observer for each question. Hence, whatever question card the user sees (or more accurately completely in view) it sends an API request to the backend to update the object in the backend and store the user session in the corresponding Set for the question in the backend object. In addition, whenever the user scrolls out of view for a question card, browser sends another API call to the backend to remove the user session from the corresponding question set in the backend

## Further engineering enhancements
1. Implement a locking mechanism acting on the object in the backend that stores the user sessions so that only one execution at a time can manipulate the object to ensure data consistency
2. Add an event listener that detects when the user finishes scrolling, then checks what is the question cards in view and update them together in the backend rather than doing an API call each time a question card gets into / removes from view. Reduces API calls to the server.