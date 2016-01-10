# ShopInOrder 
Application which helps you organize your shopping lists. Every item may have a category to which it belongs. Every list may have a layout which represents order of categories in your shop. So you first define layout (order of categories) of your shop and then you add this layout to a list. After that, items of the list will be respecting the order of the layout.

Client (angular) at <code>https://sange-icinga.hukot.net:8443</code>

Test user:

 * email: <code>sange@seznam.cz</code>
 * password: <code>pm123.</code>

## API overview

Application combines two APIs:

* google sheet API for retrieving categories from public google spreadsheet
* [Parse API](https://parse.com/) which is used for backing database and user management

and it provides own API, listed methods below.

### Headers
These headers are necessary for consuming Parse API. App sends them on behalf of the client, except X-Parse-Session-Token.

| Key                    | Value                                       |
|------------------------|---------------------------------------------|
| X-Parse-REST-API-Key   | 3kN0dGXh5X7dMCXk1UmmgWNUZrtG6hyFVdiv6OxV    |
| X-Parse-Application-Id | PKeL1iyUnVnfayP2g99XelQRGFQbpWE3P9DASAo6    |
| X-Parse-Session-Token  | from_login_response                         | 

### Methods
<code>URL prefix: 'https://sange-icinga.hukot.net:8443/api/1.0'</code>
**All methods except the first three require passing session token named "token" from /login or /register request as a header "token".**
All POST methods accept parameters in body (raw).

| HTTP Method| URL        | Operation                                        | Required params                   |
| -----------|------------|-------------------------------------------------|------------------------------------|
| POST       | /register  | register new user (requires email verification) | username, email, password          |        
| POST       | /login     | login user                                      | username, password                 |
| GET        | /category  | list categories                                 |                                    |
| POST       | /list      | create list at given position of your lists     | name, position, layout_id, ACL     |  
| GET        | /list      | list lists                                      |                                    |    
| GET        | /list/id   | retrieve list with given id                     |                                    |     
| PUT        | /list/id   | update any list's parameter                     |                                    |   
| DELETE     | /list/id   | delete list with given id                       |                                    |    
| POST       | /layout    | create layout at given position of your layouts | name, position, categories, ACL    |    
| GET        | /layout    | list layouts                                    |                                    |      
| GET        | /layout/id | retrieve layout with given id                   |                                    |    
| PUT        | /layout/id | update any layout's parameter                   |                                    |      
| DELETE     | /layout/id | delete layout with given id                     |                                    |      
| POST       | /item      | create item                                     | name, category, list_id, ACL       |
| GET        | /item      | list items                                      |                                    |    
| GET        | /item/id   | retrieve item with given id                     |                                    |    
| PUT        | /item/id   | update item                                     |                                    |    
| DELETE     | /item/id   | delete item with given id                       |                                    |    

* successful **registration requires email verification** (=click on received link in registration email)
* all **requests** and **responses** are in **JSON**, see examples below
* **position**: lower number, higher position
* **list_id, layout_id**: string id reference to list resp. layout, when you want to unset this reference, use null as a value instead of string 
* with **ACL** you can **control access rights** to an object, example below: 
```
ACL: objects only for you
"ACL": {
        "vX8......8N": {
          "read": true,
          "write": true
        }
      }
```

## Example request & responses

### Successful
* GET and DELETE requests do not contain body, so request is not listed with these methods.
* DELETE response is empty object.
#### POST /register
#####request:
```
{
    "username":"myname",
    "password":"mypass",
    "email":"email@email.com"
}
```
#####response:
```
{
  "token": "r:NTgtL2..........Ko2skCv"
}
```

####POST /login
#####request:
```
{
    "username":"myname",
    "password":"mypass",
}
```
#####response:
```
{
  "token": "r:NTgtL2..........Ko2skCv"
}
```

####GET /category
#####response:
```
[
  {
    "desc": "uncatogorized",
    "name": "uncatogorized",
    "id": "0"
  },
  ...
  {
    "desc": "baby items, pet items, batteries, greeting cards",
    "name": "Other",
    "id": "12"
  }
]
```

####POST /list
#####request:
```
{
    "name":"list 2342",
    "desc":"",
    "position": 7,
    "layout_id": "qc....T",
    "ACL":{
      "vX.....N": {
        "read": true,
        "write": true
      }
    }
}
```
#####response:
```
{
  "createdAt": "2016-01-10T22:17:21.216Z",
  "objectId": "Gq....q2"
}
```

####GET /list
#####response:
```
{
  "results": [
    {
      "ACL": {
        "vX8......8N": {
          "read": true,
          "write": true
        }
      },
      "createdAt": "2015-12-30T12:08:27.655Z",
      "layout_id": {
        "__type": "Pointer",
        "className": "layouts",
        "objectId": "qcD......CT"
      },
      "name": "listX",
      "objectId": "rXX.....cb",
      "position": 1,
      "updatedAt": "2016-01-07T12:26:44.853Z"
    }
  ]
}
```
####GET /list/id
Same as <code>GET /list</code> except it returns only one object (or error).


####PUT /list/id
#####request:
```
{
    "name":"list xxx",
    "desc":"",
    "position":1,
    "layout_id": null,
    "ACL":{
      "vX.....N": {
        "read": true,
        "write": true
      }
    }
}
```
#####response:
```
{
  "updatedAt": "2016-01-10T22:20:45.416Z"
}
```

####POST /layout
#####request:
```
{
    "name":"layout 1",
    "desc":"",
    "position": 7,
    "categories": [7, 8, 0],
    "ACL":{
      "vX.....N": {
        "read": true,
        "write": true
      }
    }
}
```
#####response:
```
{
  "createdAt": "2016-01-10T22:17:21.216Z",
  "objectId": "Gq....q2"
}
```


####GET /layout
#####response:
```
{
  "results": [
    {
      "ACL": {
        "vX8......8N": {
          "read": true,
          "write": true
        }
      },
      "createdAt": "2015-12-30T12:08:27.655Z",
      "categories": [1, 2, 1, 4, 0],
      "name": "listX",
      "objectId": "rXX.....cb",
      "position": 1,
      "updatedAt": "2016-01-07T12:26:44.853Z"
    },
    .....
    {
    ....
    }
  ]
}
```
####GET /layout/id
Same as <code>GET /layout</code> except it returns only one object (or error).


####PUT /layout/id
#####request:
```
{
    "name":"layout 2",
    "desc":"",
    "position": 3,
    "categories": [0, 9, 7],
    "ACL":{
      "vX.....N": {
        "read": true,
        "write": true
      }
    }
}
```
#####response:
```
{
  "updatedAt": "2016-01-10T22:20:45.416Z"
}
```

####POST /item
#####request:
```
{
    "name":"item 3",
    "desc":"",
    "category": 2,
    "list_id": "xA....ew",
    "ACL":{
      "vX85j2mq8N": {
        "read": true,
        "write": true
      }
    }
}
```
#####response:
```
{
  "createdAt": "2016-01-10T22:17:21.216Z",
  "objectId": "Gq....q2"
}
```


####GET /item
#####response:
```
{
  "results": [
    {
      "ACL": {
        "vX......": {
          "read": true,
          "write": true
        }
      },
      "category": 0,
      "createdAt": "2015-12-30T14:27:03.891Z",
      "desc": "",
      "list_id": {
        "__type": "Pointer",
        "className": "lists",
        "objectId": "rX.....cb"
      },
      "name": "itemmmmm",
      "objectId": "3....V",
      "updatedAt": "2016-01-06T10:58:52.639Z"
    },
    .....
    {
    ....
    }
  ]
}
```
####GET /item/id
Same as <code>GET /item</code> except it returns only one object (or error).


####PUT /item/id
#####request:
```
{
    "name":"item 3",
    "desc":"",
    "category": 2,
    "list_id": "xA....ew",
    "ACL":{
      "vX85j2mq8N": {
        "read": true,
        "write": true
      }
    }
}
```
#####response:
```
{
  "updatedAt": "2016-01-10T22:20:45.416Z"
}
```


### Errors
```
With appropriate HTTP status code
{
  "err": "Message to specify what went wrong."
}
```


