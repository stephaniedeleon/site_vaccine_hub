const { UnauthorizedError } = require("../utils/errors")

class User {

    static async login(credentials) {
        //user should submit their email and password
        //if any of these fields are missing, throw an error

        // lookup the user in db by email
        // if a user id found compare the submitted password
        // with password in db
        // if there is a match, return the user

        // if any of this goes wrong, thrown an error

        throw new UnauthorizedError("Invalis email/password combo")
    }

    static async register(credentials) {
        //user should submit their email, pw, date, and location
        // if any fields are missing, throw an error

        //make sure no user already exists in the system with that email
        // if yes, throw error

        // take uers password and hash it
        // take users email and lowercase it

        // create a new user in the db with all their info
        // return user
    }
}

module.exports = User;