exports.success = (res, data = null, msg = "Success") => {
  return res.status(200).json({
    status: true,
    data,
    msg,
  });
};

exports.error = (res, msg = "Something went wrong") => {
  return res.status(200).json({
    status: false,
    msg,
  });
};
