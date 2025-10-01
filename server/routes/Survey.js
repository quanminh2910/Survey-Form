const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Survey = require('../models/Survey');

// --- Create a new survey ---
// @route   POST /api/surveys
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, questions } = req.body;
        const newSurvey = new Survey({
            creatorId: req.user.id,
            title,
            questions,
        });

        const survey = await newSurvey.save();
        res.json(survey);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Get all surveys for the logged-in user ---
// @route   GET /api/surveys
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const surveys = await Survey.find({ creatorId: req.user.id });
        res.json(surveys);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Get a single survey by ID (for survey creator to view/edit) ---
// @route   GET /api/surveys/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) {
            return res.status(404).json({ msg: 'Survey not found' });
        }
        // Ensure the user owns the survey
        if (survey.creatorId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        res.json(survey);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Get a single survey by ID (for public respondents) ---
// @route   GET /api/surveys/public/:id
// @access  Public
router.get('/public/:id', async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey || survey.status !== 'Active') {
            return res.status(404).json({ msg: 'Survey not found or is not active' });
        }
        // Return a version of the survey without creator info for privacy
        const publicSurvey = {
            _id: survey._id,
            title: survey.title,
            questions: survey.questions
        };
        res.json(publicSurvey);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Update a survey ---
// @route   PUT /api/surveys/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let survey = await Survey.findById(req.params.id);
        if (!survey) return res.status(404).json({ msg: 'Survey not found' });

        // Check ownership
        if (survey.creatorId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        survey = await Survey.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

        res.json(survey);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
