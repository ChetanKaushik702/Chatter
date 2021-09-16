const getMessage = (text, userName) => {
    return {
        text,
        userName,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    getMessage
}