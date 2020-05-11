const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const auth = require('../../Middleware/auth');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const checkObjectId = require('../../Middleware/checkObjectId');

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
      skills,
      status,
      youtube,
      facebook,
      twitter,
      instagram,
    } = req.body;

    //Build profile object
    const profileFields = {
      user: req.user.id,
      location,
      website: website === '' ? '' : normalize(website, { forceHttps: true }),
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim()),
      status,
    };

    //Build social array
    const socialfields = { youtube, twitter, instagram, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    try {
      //using upsert option
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (ere) {
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
router.get(
  '/user/:user_id',
  checkObjectId('user_id'),
  async ({ params: { user_id } }, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.params.user_id,
      }).populate('user', ['name', 'avatar']);
      if (!profile)
        return res.status(400).json({
          msg: 'Profile not found',
        });
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectID') {
        return res.status(400).json({
          msg: 'Profile not found',
        });
      }
      return res.status(500).send('Server Error');
    }
  }
);
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
    const { title, location, description } = req.body;
    const newExp = {
      title,
      location,
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
    const foundprofile = await Profile.findOne({
      user: req.user.id,
    });

    foundprofile.experience = foundprofile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await foundprofile.save();
    return res.status(200).json(foundprofile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Eror');
  }
});

module.exports = router;
