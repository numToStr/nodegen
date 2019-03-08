const createUser = async (req, res, next) => {
    try {
        const { name } = req.body;

        res.status(201).json({
            message: "Successfully created",
            data: {
                user: name
            }
        });
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        res.status(200).json({
            message: "Successful",
            data: {
                user: id
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getUser
};
