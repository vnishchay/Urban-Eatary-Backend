const Restaurant = require('./../models/restaurantModel');
const bson = require('bson');

exports.createRestaurant = async (req, res) => {
  console.log(req.body);
  try {
    const { name, phoneNumber, address } = req.body;

    if (phoneNumber.length != 10) {
      throw new Error('Phone Number must be of Length 10');
    }

    if (name && address) {
      const result = await Restaurant.create({ name, phoneNumber, address });

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    }

    res.status(400).json({
      status: 'fail',
      message: 'Missing required Fields',
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const result = await Restaurant.findById(req.params.id);

    if (!result) {
      return res.status(400).json({
        status: 'fail',
        message: 'Error Occured',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getAllRestaurant = async (req, res) => {
  try {
    const result = await Restaurant.find();

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { name, address, phoneNumber } = req.body;

    const updatedData = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, address, phoneNumber },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bad Request',
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedData,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const result = await Restaurant.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bad Request',
      });
    }

    res.status(204).json({
      status: 'success',
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.displayRestaurantFood = async (req, res) => {
  try {
    const result = await Restaurant.aggregate([
      {
        $match: { _id: new bson.ObjectId(req.params.id) },
      },
      {
        $lookup: {
          from: 'Food Model',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$id', '$restaurant'],
                },
              },
            },
            {
              $project: {
                name: '$name',
                category: '$category',
                description: '$description',
                story: '$story',
                price: '$price',
              },
            },
          ],
          as: 'foodItems',
        },
      },
      {
        $project: {
          foodItems: 1,
        },
      },
    ]);

    if (!result) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bad Request',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
