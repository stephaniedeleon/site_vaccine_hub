const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { UnauthorizedError, BadRequestError } = require("../utils/errors")

class User {

    //prevents the password from showing up in JSON
    static async makePublicUser(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            location: user.location,
            date: user.date
        }
    }

    //login
    static async login(credentials) {

        //user should submit their email and password
        //if any of these fields are missing, throw an error
        const requiredFields = ["email", "password"];
        requiredFields.forEach(field => {
            if(!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body.`);
            }
        });

        // lookup the user in db by email
        const user = await User.fetchUserByEmail(credentials.email);
        // if a user id found compare the submitted password
        // with password in db
        // if there is a match, return the user
        if (user) {
            const hashedPw = user.password;
			const plaintextPw = credentials.password
			const result = await bcrypt.compare(plaintextPw, hashedPw);

            if (result) {
				return User.makePublicUser(user);
			}
        }

        // if any of this goes wrong, thrown an error
        throw new UnauthorizedError("Invalid email/password combo")
    }


    // register
    static async register(credentials) {

        // user should submit their "email", "password", "firstName", "lastName", "location", "date"
        // if any fields are missing, throw an error
        const requiredFields = ["email", "password", "firstName", "lastName", "location", "date"];
        requiredFields.forEach(field => {
            if(!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body.`);
            }
        });

        if (credentials.email.indexOf("@") <= 0){
            throw new BadRequestError(`Invalid email.`);
        }

        // make sure no user already exists in the system with that email
        // if yes, throw error
        const existingUser = await User.fetchUserByEmail(credentials.email);
        if (existingUser) {
            throw new BadRequestError(`Duplicate email: ${credentials.email}`);
        }

        // take uers password and hash it
        const hashedPw = await bcrypt.hash(credentials.password, BCRYPT_WORK_FACTOR);
        // take users email and lowercase it
        const lowercaseEmail = credentials.email.toLowerCase();

        // create a new user in the db with all their info
        const results = await db.query(`
			INSERT INTO users (
                email, 
                password, 
                first_name, 
                last_name, 
                location, 
                date) 
            VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING email, password, first_name, last_name, location, date
		`, 
            [lowercaseEmail, hashedPw, credentials.firstName, credentials.lastName, credentials.location, credentials.date]
		);

        // return user
        const user = results.rows[0];
		return User.makePublicUser(user); 
    }


    //Fetch user by email
    static async fetchUserByEmail(email) {

        // if no email supplied
        if(!email) {
            throw new BadRequestError("No email provided");
        }

        // $1 is a query parameter
        const query = `SELECT * FROM users WHERE email=$1`;
        const result = await db.query(query, [email.toLowerCase()]);

        const user = result.rows[0];

        return user;
    }
}

module.exports = User;