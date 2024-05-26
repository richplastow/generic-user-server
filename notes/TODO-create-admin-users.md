
## Generate a hash from a salt and a password

```bash
node -e "console.log(require('crypto').pbkdf2Sync('my_pass','my_salt',1000,16,'sha512').toString('hex'))"
# 2aa04e2e4fd0d86d5f4cf5063e671ec8
```
