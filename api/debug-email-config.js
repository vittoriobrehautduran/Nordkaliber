module.exports = async (req, res) => {
  try {
    // Get environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const productionEmail = process.env.PRODUCTION_MANAGER_EMAIL;
    
    // Check if variables exist
    const hasEmailUser = !!emailUser;
    const hasEmailPassword = !!emailPassword;
    const hasProductionEmail = !!productionEmail;
    
    // Show password length (but not the actual password)
    const passwordLength = emailPassword ? emailPassword.length : 0;
    
    // Check if password looks like an app password (should be 16 characters)
    const isAppPasswordLength = passwordLength === 16;
    
    // Check if email user is correct
    const isCorrectEmail = emailUser === 'nordkaliber@gmail.com';
    
    // Test nodemailer import
    let nodemailerStatus = 'Not tested';
    try {
      const nodemailer = require('nodemailer');
      nodemailerStatus = 'Loaded successfully';
    } catch (error) {
      nodemailerStatus = `Failed to load: ${error.message}`;
    }
    
    const debugInfo = {
      environment: {
        emailUser,
        hasEmailUser,
        isCorrectEmail,
        hasEmailPassword,
        passwordLength,
        isAppPasswordLength,
        hasProductionEmail,
        productionEmail
      },
      nodemailer: {
        status: nodemailerStatus
      },
      recommendations: []
    };
    
    // Add recommendations based on findings
    if (!hasEmailUser) {
      debugInfo.recommendations.push('EMAIL_USER environment variable is missing');
    }
    
    if (!hasEmailPassword) {
      debugInfo.recommendations.push('EMAIL_PASSWORD environment variable is missing');
    }
    
    if (!isCorrectEmail) {
      debugInfo.recommendations.push('EMAIL_USER should be nordkaliber@gmail.com');
    }
    
    if (!isAppPasswordLength) {
      debugInfo.recommendations.push(`App password should be 16 characters (current: ${passwordLength})`);
    }
    
    if (!hasProductionEmail) {
      debugInfo.recommendations.push('PRODUCTION_MANAGER_EMAIL environment variable is missing');
    }
    
    if (nodemailerStatus !== 'Loaded successfully') {
      debugInfo.recommendations.push('Nodemailer is not loading properly');
    }
    
    // Check if all basic requirements are met
    const allBasicRequirementsMet = hasEmailUser && hasEmailPassword && isCorrectEmail && isAppPasswordLength && hasProductionEmail;
    
    debugInfo.summary = {
      allBasicRequirementsMet,
      status: allBasicRequirementsMet ? 'Configuration looks correct' : 'Configuration issues found'
    };
    
    res.status(200).json(debugInfo);
    
  } catch (error) {
    console.error('❌ Debug email config error:', error);
    res.status(500).json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    });
  }
}; 