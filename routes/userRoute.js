const express = require("express");
const authController = require("./../controller/authController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const router = express.Router();

router.put('/loginGoogle', authController.loginGoogle);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/uploadImage', upload.single('image'), authController.uploadImage);
router.get('/downloadImage/:key', authController.getImage)

router.use(authController.protect);
router.get('/validateLogin', authController.validateLogin);
router.get('/getMe', authController.getLoggedUserInfo)

router.use(authController.restrictTo('admin'));
router.get('/role/:id/:role', authController.changeRoleTo);

module.exports = router;