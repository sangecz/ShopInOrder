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

| HTTP Method| URL        | Operation                                        | Required params          |
| -----------|------------|-------------------------------------------------|---------------------------|
| POST       | /register  | register new user (requires email verification) | username, email, password |        
| POST       | /login     | login user                                      | username, password        |
| GET        | /category  | list categories                                 |                           |
| POST       | /list      | create list at given position of your lists (lower number, higher position) | name, position, categories, ACL |  
| GET        | /list/id   | retrieve list with given id                     |                           |     
| GET        | /list      | list lists                                      |                           |    
| PUT        | /list/id   | update list     |   |   
| DELETE     | /list/id   | delete list with given id                       |                           |    
| POST       | /layout    | create layout at given position of your layouts (lower number, higher position) | name, position, categories, ACL |    
| GET        | /layout/id | retrieve layout with given id                   |                           |    
| GET        | /layout    | list layouts                                    |                           |      
| PUT        | /layout/id | update layout   |   |      
| DELETE     | /layout/id | delete layout with given id                     |                           |      
| POST       | /item      | create item     |   |
| GET        | /item/id   | retrieve item   |   |    
| GET        | /item      | list items      |   |    
| PUT        | /item/id   | update item     |   |    
| DELETE     | /item/id   | delete item     |   |    

* successful registration requires email verification (=click on received link in registration email)
* all requests and responses are in JSON, see examples below

```
ACL: objects only for you
"ACL": {
        "vX8......8N": {
          "read": true,
          "write": true
        }
      }
```


## Example responses

### Successful
TODO pridat priklady requestu!!

```
POST /login or POST /register
{
  "token": "r:NTgtL2..........Ko2skCv"
}
```

```
GET /category
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

```
GET /list    --> array of object(s) 
GET /list/id --> one object (or error)
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

```
POST /list or POST /layout or POST /item
{
  "createdAt": "2016-01-08T09:15:38.100Z",
  "objectId": "xA.......w"
}
```

```
GET /layout    --> array of object(s) 
GET /layout/id --> one object (or error)
{
  "results": [
    {
      "ACL": {
        "v......N": {
          "read": true,
          "write": true
        }
      },
      "categories": [ 6, 5, 1, 4, 0 ],
      "createdAt": "2015-12-30T08:41:50.302Z",
      "name": "billa",
      "objectId": "qcD.....LCT",
      "updatedAt": "2015-12-30T09:36:31.547Z"
    },
    { ... }
    , ...
  ]
}
```


### Errors
```
With appropriate HTTP status code
{
  "err": "Message to specify what went wrong."
}
```











