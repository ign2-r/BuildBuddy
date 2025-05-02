const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateBearer(req, res, next) {
    const auth = req.headers.authorization || "";
    const { AUTH_SECRET, AUTH_ISSUER, AUTH_AUDIENCE } = process.env;
    const [scheme, token] = auth.split(" ");

    if ((scheme !== "Bearer" && scheme !== "bearer") || !token) {
        return res.status(401).json({ error: "Unauthorized, please check bearer token" });
    }

    try {
        const payload = jwt.verify(token, AUTH_SECRET, {
            algorithms: ["HS256"],
            issuer: AUTH_ISSUER,
            audience: AUTH_AUDIENCE,
        });
        req.user = payload; // attach your payload to the request
        next();
    } catch (err) {
        console.error("Error auth",err);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

function authenticateViaSecret(req, res, next) {
    const auth = req.headers.authorization || "";
    const { AUTH_ADMIN } = process.env;
    const [scheme, token] = auth.split(" ");
    console.debug(token, AUTH_ADMIN);

    if ((scheme !== "Bearer" && scheme !== "bearer") || !token) {
        return res.status(401).json({ error: "Unauthorized, please check bearer token" });
    }

    try {
        if(AUTH_ADMIN !== token){
            throw new Error("Incorrect Secret");
        }
        next();
    } catch (err) {
        console.error("Error secret auth",err);
        return res.status(403).json({ error: "Invalid token" });
    }
}

module.exports = { authenticateBearer, authenticateViaSecret};
