# Step 2: Set up AWS DynamoDB

[^ Notes](./00-notes.md)

## What is DynamoDB?

From <https://blog.marcia.dev/using-aws-dynamodb-to-build-web-apps#heading-2amazon-dynamodb-101>

> _"Amazon DynamoDB is a fast, flexible, serverless NoSQL database service that_
> _delivers single-digit millisecond performance at any scale."_

### Data models

DynamoDB supports two main data models: key-value and wide-column.

The key-value data model lets you retrieve one item at a time using a primary
key, like a massive hash, enabling fast retrieval when the primary key is known.

The wide-column data model is more complex access patterns. The hash is still
required, but the value for each hash record is a B-tree. A B-tree is a data
structure that enables quick element retrieval and range queries.

### Main components

Data is organised into tables, which can be created or deleted with a simple API
call. Each table contains items, and each item has attributes. Every item
requires at least one attribute, the partition key. Optionally, you can define
a sort key, which becomes another required attribute for each item.

The combination of the partition key and sort key (if defined) forms the primary
key, which must be unique. Each item can also have additional attributes, and
the set of attributes can vary from item to item.

Local secondary indexes and global secondary indexes are supported, providing
alternative ways to retrieve data efficiently..

### The 3 main operation types

1. __Item-based operation:__ Performed on an individual item in a table
2. __Query:__ Operate on a group of items that share the same partition key in
   a table or secondary index (this group is referred to as an item collection)
3. __Scan:__ Retrieve all items in a table, eg for processing the entire dataset


## 'Always Free' limits and pricing

AWS used to offer SimpleDB with an 'Always Free' free tier. That seems to have
been superseded by DynamoDB which has (in May 2024) these 'Always Free' limits:

- 25 GB of storage
- 25 units of read capacity
- 25 units of write capacity
- Enough to handle up to 200 million requests per month

One 'read capacity unit' (RCU) is charged for each strongly consistent read per
second, two for transactional reads, and half for each eventually consistent
read per second (up to 4 KB).

One 'write capacity units' (WCU) is charged for each write per second (up to
1 KB), and two WCUs for each transactional write per second.

Beyond the 'Always Free' limits, here's the May 2024 prices:

### On-demand capacity mode

- $0.25 per million Standard read request units
- $1.25 per million Standard write request units
- $0.31 per million Standard-Infrequent read request units
- $1.56 per million Standard-Infrequent write request units
- First 25 GB stored per month is free using the DynamoDB Standard table class
- $0.25 per GB-month thereafter, for Standard
- $0.10 per GB-month thereafter, for Standard-Infrequent

...see <https://aws.amazon.com/dynamodb/pricing/on-demand/> for more.

### Provisioned capacity mode

- $0.00013 per Standard read request unit per hour
- $0.00065 per Standard write request unit per hour
- $0.00016 per Standard-Infrequent read request unit per hour
- $0.00081 per Standard-Infrequent write request unit per hour
- First 25 GB stored per month is free using the DynamoDB Standard table class
- $0.25 per GB-month thereafter, for Standard
- $0.10 per GB-month thereafter, for Standard-Infrequent

...see <https://aws.amazon.com/dynamodb/pricing/provisioned/> for more.

## Create a default DynamoDB table

Assuming you have an AWS account:

Click ‘Create table’ at <https://eu-central-1.console.aws.amazon.com/dynamodbv2/>

- Table name: `generic-user-server-db`
- Partition key: `userID`
- Sort key - optional: (leave blank)
- Table settings: Default settings

| Setting                    | Value                 | Editable after creation |
| -------------------------- | --------------------- | ----------------------- |
| Table class                | DynamoDB Standard     | Yes                     |
| Capacity mode              | Provisioned           | Yes                     |
| Provisioned read capacity  | 5 RCU                 | Yes                     |
| Provisioned write capacity | 5 WCU                 | Yes                     |
| Auto scaling               | On                    | Yes                     |
| Local secondary indexes    | -                     | No                      |
| Global secondary indexes   | -                     | Yes                     |
| Encryption key management  | Owned by DynamoDB     | Yes                     |
| Deletion protection        | Off                   | Yes                     |
| Resource based policy      | Not active            | Yes                     |

We don't need any Tags, so click ‘Create Table’.

After the ‘Status’ changes to ‘Active’ (about 20 seconds) click on the Name link
‘generic-user-server-db’.

## Create an Item using the AWS console

Under ‘Actions’ click ‘Create item’.

- userId: `tmp`
- Click ‘Add new attribute’ -> ‘String’
- Attribute name: `email`
- Value: `tmp@example.com`

Click ‘Create item’. Yous should see "The item has been saved successfully" on
the next page.

## Configure programmatic access using IAM Identity Center

From <https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html> 

### Enable IAM Identity Center

> _"IAM Identity Center is offered at no additional charge"_

From <https://docs.aws.amazon.com/singlesignon/latest/userguide/get-set-up-for-idc.html>

Assuming you are signed in to your AWS root user account:

- Open the [IAM Identity Center console](https://console.aws.amazon.com/singlesignon)
- Click ‘Enable’
- Choose ‘Enable in only this AWS account’, to keep things simple
- Click ‘Continue’

We don't need any Tags, so click ‘Enable’.

After about 10 seconds you should see the IAM Identity Center dashboard.

### Create a new user

Somewhat follow "I do not have established access through IAM Identity Center"
at <https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html>...

In the IAM Identity Center dashboard, click ‘Users’ in the left sidebar, and
click ‘Add User’.

- Username: `generic-user-server-user`
- Choose ‘Generate a one-time password...’
- Email address and Confirm email address: `can-be-nonexistent@example.com`
- First name: `GenericUserServer`
- Last name: `User`
- Display name: `GenericUserServer User`

Click ‘Next’ and ‘Next’ again (the 5 optional sections and ‘Add user to groups’
can be ignored). Click ‘Add user’.

Click ‘Copy’ to copy the ‘AWS access portal URL’, ‘Username’ and ‘One-time
password’. Paste it into a text document, eg:

```
AWS access portal URL: https://d-99677dc1f5.awsapps.com/start, Username: 
generic-user-server-user, One-time password: wPH*KZjo*_Gv0/nctMm2$#5b#x*ugq6D1n
```

Click ‘Close’.

### Grant 'power user' credentials to the new user

In a different browser, visit the ‘AWS access portal URL’ above and sign in with
those credentials. Choose ‘Authenticator app’ and click ‘Next’. Follow the MFA
instructions and then click ‘Assign MFA’.

You should see "Authenticator app registered". Click ‘Done’. Set a new password,
eg `qGrTh_*hya71FB`, and sign in again.

You should see "You have navigated to the AWS access portal".

Back in the [IAM Identity Center](https://console.aws.amazon.com/singlesignon),
after refreshing, you should see that the user now has 1 MFA device. Click on
the Username, and then click the ‘Applications’ tab - currently there are no
Applications to assign to the user.

### Create the `generic-user-server-group` group

In the IAM Identity Center dashboard, click ‘Groups’ in the left sidebar, and
click ‘Create group’.

- Group name: `generic-user-server-group`
- Description - optional: `Credentials for accessing generic-user-server-db`
- Under ‘Add users to group’, tick the checkbox next to ‘generic-user-server-user’
- Click ‘Create group’


### Create an Application to assign to the user

In the IAM Identity Center dashboard, click ‘Applications’ in the left sidebar.
Under ‘Actions’ select ‘Enable’.

## Get the AWS access key ID and secret access key

From <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SettingUp.DynamoWebService.html> 