_Berfore you run this Project you must_

- create (config.env) file and set DATABASE_NAME, and password if you will use Atlas
  ex: DATABASE_LOCAL=mongodb://127.0.0.1/databasename
- set your PORT
- add JWT_SECRET for encryp passwords
- add JWT_TOKEN_VALID_FOR=30d , now token will be valid for 30 days after that usermust login again
- add JWT_COOKIE_EXPIRES_IN=10, this cookie expires time to send it in mail to user to Reset his Password

_In this project made RestfullAPIs like_

- For Users => signUp, login, deleteMe, updateMe, forgetPassword and resetPassword
- For Tours => createTour, deleteTour, updateTour, reviewTour, getAllTours and get oneTour
- For Rendering => I'm Using pug engine

_and this is Full APIs Documentation_

- https://documenter.getpostman.com/view/8774275/2s93CNNDM8
