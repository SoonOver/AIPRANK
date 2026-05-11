```javascript
const { TelegramService } = require('../services/TelegramService');
const { logger } = require('../utils/logger');

module.exports = async (ctx) => {
  try {
    await TelegramService.start(ctx);
  } catch (error) {
    logger.error('Error pada perintah start:', error);
  }
};
```