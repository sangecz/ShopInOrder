# ShopInOrder 

Application (angular client) at <code>https://sange-icinga.hukot.net:3000/sio</code>
Shortened: <code>SHORTCUT_URL</code>

## API overview

### Headers

| Key                    | Value                                       |
|------------------------|---------------------------------------------|
| X-Parse-REST-API-Key   | 3kN0dGXh5X7dMCXk1UmmgWNUZrtG6hyFVdiv6OxV    |
| X-Parse-Application-Id | PKeL1iyUnVnfayP2g99XelQRGFQbpWE3P9DASAo6    |
| X-Parse-Session-Token  | from_login_response                         | 

### Methods

<code>URL prefix: 'https://sange-icinga.hukot.net:3000/sio/api/1.0'</code>

| HTTP Method  | URL            | Operation       | Required params           | Optional params | Params type | Response TODO       | 
| -------------|----------------|-----------------|---------------------------|-----------------|-------------|---------------------|
| POST         | /register      | register user   | username, email, password |                 | body        | obj                 |
| GET          | /login         | login user      | username, password        |                 | url-encoded | obj (session token) |   
| GET          | /category      | list categories |                           |                 |             | array of objects    |
| POST         | /item          | create item     | name, list_id,  | desc |  |  |
| GET          | /item/id       | retrieve item   |   |  |  |  |
| GET          | /item          | list items      |   |  |  |  |
| PUT          | /item/id       | update item     |   |  |  |  |
| DELETE       | /item/id       | delete item     |   |  |  |  |
| POST         | /list          | create list     |   |  |  |  |
| GET          | /list/id       | retrieve list   |   |  |  |  |
| GET          | /list          | list lists      |   |  |  |  |
| PUT          | /list/id       | update list     |   |  |  |  |
| DELETE       | /list/id       | delete list     |   |  |  |  |
| POST         | /layout        | create layout   |   |  |  |  |
| GET          | /layout/id     | retrieve layout |   |  |  |  |
| GET          | /layout        | list layouts    |   |  |  |  |
| PUT          | /layout/id     | update layout   |   |  |  |  |
| DELETE       | /layout/id     | delete layout   |   |  |  |  |

* successful registration requires email verification (=click on received link in registration email)
* all responses are in JSON, see examples below

## Example responses

### Successful
TODO

### Errors
TODO 












