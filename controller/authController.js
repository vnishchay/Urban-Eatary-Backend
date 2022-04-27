const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const createError = require('http-errors');
const request = require('request');
const validator = require('validator');
const User = require('./../models/userModel');
const { uploadFile, getFileStream } = require('./../utils/s3');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const multer = require('multer');

const { OAuth2Client } = require('google-auth-library');
const clientID = process.env.CLIENT_ID;
const client = new OAuth2Client(clientID);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, id, statusCode, req, res) => {
  const token = signToken(id);
  const name = user.firstName + ' ' + user.lastName;
  let data = { name, role: user.role };
  if (user.googleUser) {
    data.picture = user.googleUser.picture;
  }

  res.status(statusCode).json({
    statusCode,
    token,
    data,
  });
};

exports.loginGoogle = (req, res, next) => {
  let token = req.body.token;
  client
    .verifyIdToken({
      idToken: token,
      audience: clientID,
    })
    .then(async (response) => {
      const payload = response.getPayload();
      if (payload.email_verified) {
        const existingUser = await User.findOne({
          email: payload.email,
        });
        if (!existingUser) {
          const googleUser = {
            id: payload.sub,
            picture: payload.picture,
          };
          const newUser = await User.create({
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            password: process.env.DEFAULT_PASSWORD,
            passwordConfirm: process.env.DEFAULT_PASSWORD,
            googleUser,
          });
          createSendToken(newUser, newUser._id, 201, req, res);
        } else {
          if (!existingUser.googleUser.id) {
            const googleUser = {
              id: payload.sub,
              picture: payload.picture,
            };
            const newUser = await User.findByIdAndUpdate(existingUser._id, {
              firstName: payload.given_name,
              lastName: payload.family_name,
              googleUser,
            });
            createSendToken(newUser, newUser._id, 201, req, res);
          } else {
            createSendToken(existingUser, existingUser._id, 200, req, res);
          }
        }
      } else {
        return next(createError(401, 'Invalid Credentials found'));
      }
    })
    .catch((err) => {
      return next(createError(401, err.message));
    });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    console.log(newUser);
    createSendToken(newUser, newUser._id, 201, req, res);
  } catch (err) {
    return next(createError(400, err));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) {
      return next(createError(500, 'email or password required'));
    }

    if (validator.isEmail(email)) {
      const user = await User.findOne({ email: email }).select('+password');
      if (user && (await user.CheckPass(password, user.password))) {
        createSendToken(user, user._id, 200, req, res);
      } else {
        return next(createError(400, 'email or password is not correct'));
      }
    } else {
      res.status(400).json({
        statusCode: 400,
        message: 'Invalid Email Found',
      });
    }
  } catch (err) {
    return next(new Error(err));
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'null') {
      return next(
        createError(401, 'You are not logged in! Please log in to get access.')
      );
    }

    // decodeing the jwt token to get the data to get the payload data
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        createError(
          401,
          'The user belonging to this token does no longer exist.'
        )
      );
    }

    req.user = currentUser._id;
    next();
  } catch (err) {
    return next(new Error(err.message));
  }
};

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user);
    if (!roles.includes(user.role)) {
      return next(
        createError(403, 'You do not have permission to perform this action')
      );
    }
    next();
  };
};

exports.validateLogin = async (req, res) => {
  let userDetails = await User.findById(String(req.user)).lean();
  const name = userDetails.firstName + ' ' + userDetails.lastName;
  let user = { name, role: userDetails.role };
  if (userDetails.googleUser) {
    user.picture = userDetails.googleUser.picture;
  }
  res.status(200).json({
    statusCode: 200,
    data: {
      message: 'Valid User',
      user,
    },
  });
};

exports.changeRoleTo = async (req, res) => {
  try {
    let userId = req.params.id;
    let role = req.params.role;

    const result = await User.findByIdAndUpdate(
      userId,
      {
        role,
      },
      { new: true }
    );

    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        data: 'Some Error Occured',
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    return next(createError(400, err.message));
  }
};

exports.getLoggedUserInfo = async (req, res) => {
  const user = await User.findById(req.user);

  res.status(200).json({
    statusCode: 200,
    message: user,
  });
};

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadFile(file);
    await unlinkFile(file.path);
    // console.log(result)
    // const description = req.body.description
    res.status(200).json({
      statusCode: 200,
      body: `/images/${result.Key}`,
    });
  } catch (e) {
    throw new createError(e.statusCode, e.message);
  }
};

exports.getImage = (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
};

exports.logout = (req, res) => {
  res.status(200).json({ statusCode: 200, token: null });
};
