const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateBearer = async (req, res) => {
    const { AUTH_SECRET, AUTH_ISSUER, AUTH_AUDIENCE } = process.env;
    const { _id, role } = req.body;

    try {
        if (!AUTH_SECRET) throw Error("Missing AUTH SECRET");
        res.status(200).json({ token: jwt.sign({ id: _id, role: role }, AUTH_SECRET, { algorithm: "HS256", issuer: AUTH_ISSUER, audience: AUTH_AUDIENCE, expiresIn: "1h" }) });
    } catch (err) {
        console.error("Error auth", err);
        return res.status(403).json({ error: "Invalid token creation" });
    }
};
