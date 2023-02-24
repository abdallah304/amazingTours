_Berfore you run this Project you must_

1- create (config.env) file and set DATABASE_NAME, and password if you will use Atlas
ex: DATABASE_LOCAL=mongodb://127.0.0.1/databasename
2- set your PORT
3- add JWT_SECRET for encryp passwords
4- add JWT_TOKEN_VALID_FOR=30d , now token will be valid for 30 days after that usermust login again
5- add JWT_COOKIE_EXPIRES_IN=10, this cookie expires time to send it in mail to user to Reset his Password

_In this project made RestfullAPIs like_

- For Users => signUp, login, deleteMe, updateMe, forgetPassword and resetPassword
- For Tours => createTour, deleteTour, updateTour, reviewTour, getAllTours and get oneTour
- For Rendering => I'm Using pug engine
