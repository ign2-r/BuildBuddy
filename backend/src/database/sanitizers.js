const { createFromHexString } = mongoose.Types.ObjectId;

export const sanitizeURL = (url) => {
    // return Regex.Replace(url, "[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]", "");
    const re = new RegExp("[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]");
}

export const sanitizeID = (id) => {
    const sanitizedId = id;
    // sanitize id
    return createFromHexString(sanitizedId)
}

