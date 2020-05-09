const express = require('express');
const router = express.Router();
const auth = require('../../Middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   GET api/profile/me
// @desc    Get Current USer's Profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({
        msg: 'Theres is no profile for this user',
      });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   POST api/profile/me
// @desc    Create or uupdate User's Profile
// @access  Private
router.post(
  '/',
  [auth, [check('status', 'Status is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).jason({
        errors: errors.array(),
      });
    }
    const {
      website,
      location,
      bio,
      status,
      youtube,
      facebook,
      twitter,
      instagram,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;

    //Build social array
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    try {
      let profile = Profile.findOne({
        user: req.user.id,
      });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id,
          },
          {
            $set: profileFields,
          },
          {
            new: true,
          }
        );
        return res.json(profile);
      }
      //Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/profile
// @desc    Get all Profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   GET api/profile/user/:user_id
// @desc    Get Profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile)
      return res.status(400).json({
        msg: 'Profile not found',
      });
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectID') {
      return res.status(400).json({
        msg: 'Profile not found',
      });
    }
    res.status(500).send('Server Error');
  }
});
// @route   Delete api/profile
// @desc    Delete Profile , user &posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    //remove user posts
    await Post.deleteMany({ user: req.user.id });

    //remove profile
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    //Remove user
    await User.findOneAndRemove({
      _id: req.user.id,
    });
    res.json({
      msg: 'User Deleted',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   Put api/profile/experience
// @desc    Add Experience
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Ttile is required').not().isEmpty(),
      check('description', 'description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { title, description } = req.body;
    const newExp = {
      title,
      description,
    };
    try {
      const profile = await Profile.findOne({
        user: req.user.id,
      });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   Delete api/profile/experience/:exp_id
// @desc    Delete Experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });
    //Get remove inde
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexof(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Eror');
  }
});

module.exports = router;
