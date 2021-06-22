const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { PORT } = require("./config");
const authRoutes = require("./routes/auth")

const { NotFoundError } = require("./utils/errors")

const app = express();


// enables cross-origin resource sharing for all origins
app.use(cors());
// parce incoming equest bodies with JSON payloads
app.use(express.json());
// log request info
app.use(morgan("tiny"));


// attached the auth routes
app.use("/auth", authRoutes);


// Handle all 404 errors that weren't matched by a route
app.use((req, res, next) => {
    return next(new NotFoundError());
});

// Generic error handler - anything that is unhandled will be handled here
app.use((err, req, res, next) => {

    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status }
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ` + PORT);
});