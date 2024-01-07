const accessModel = require("../models/accessModel");

const ratelimiting = async (req, res, next) => {
  const sessionId = req.session._id;
  //if session id doesn't exists

  try {
    const accessDb = await accessModel.findOne({ sessionId: sessionId });
    if (!accessDb) {
      const accessObj = new accessModel({
        sessionId: sessionId,
        time: Date.now(),
      });

      await accessObj.save();
      next();
      return;
    }

    //Compare time if sid exists
    const diff = (Date.now() - accessDb.time) / 1000;

    if (diff < 5) {
      return res.send({
        status: 400,
        message: "Too many requests,please wait for some time",
      });
    }

    //update the time in DB
    await accessModel.findOneAndUpdate({ sessionId }, { time: Date.now() });

    next();
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
};

module.exports = ratelimiting;
