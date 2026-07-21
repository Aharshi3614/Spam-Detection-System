// backend/routes/emailIntegrationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  gmailAuthUrl,
  gmailCallback,
  gmailConnect,
  gmailEmails,
  outlookAuthUrl,
  outlookCallback,
  outlookConnect,
  outlookEmails,
  scanEmails
} = require('../controllers/emailController');


router.post('/email-breakdown', protect, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Sample breakdown (replace with actual analysis)
    const breakdown = {
      spf: { score: 85, status: 'pass', details: 'SPF record validated' },
      dkim: { score: 78, status: 'pass', details: 'DKIM signature verified' },
      dmarc: { score: 70, status: 'warning', details: 'DMARC policy aligned' },
      content: { score: 45, status: 'warning', details: 'Contains promotional words' },
      overall: 70
    };
    
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze email' });
  }
});

// ==================== GMAIL ROUTES ====================
router.get("/gmail/auth-url", protect, gmailAuthUrl);
router.get("/gmail/callback", gmailCallback);
router.get("/gmail/connect", protect, gmailConnect);
router.get("/gmail/emails", protect, gmailEmails);

// ==================== OUTLOOK ROUTES ====================
router.get("/outlook/auth-url", protect, outlookAuthUrl);
router.get("/outlook/callback", outlookCallback);
router.get("/outlook/connect", protect, outlookConnect);
router.get("/outlook/emails", protect, outlookEmails);

// ==================== SCAN EMAILS ROUTE ====================
router.post("/scan-emails", protect, scanEmails);

module.exports = router;