const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Response = require('../models/Response');
const Survey = require('../models/Survey');

// --- Submit a new response to a survey ---
// @route   POST /api/responses/:surveyId
// @access  Public
router.post('/:surveyId', async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.surveyId);
        if (!survey || survey.status !== 'Active') {
            return res.status(404).json({ msg: 'Survey not found or is not active' });
        }

        const newResponse = new Response({
            surveyId: req.params.surveyId,
            answers: req.body.answers,
        });

        const response = await newResponse.save();
        res.json(response);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Get all responses for a specific survey ---
// @route   GET /api/responses/:surveyId
// @access  Private (only the survey creator can see responses)
router.get('/:surveyId', protect, async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.surveyId);
        if (!survey) {
            return res.status(404).json({ msg: 'Survey not found' });
        }

        // Ensure the user owns the survey before showing responses
        if (survey.creatorId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const responses = await Response.find({ surveyId: req.params.surveyId });
        res.json(responses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
