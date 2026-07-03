import mongoose from 'mongoose';
import { NEGATIVE_ALERT_THRESHOLD_DEFAULT } from '../utils/constants.js';

const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    siteName: { type: String, default: 'GovSense AI' },
    negativeAlertThreshold: { type: Number, default: NEGATIVE_ALERT_THRESHOLD_DEFAULT },
    maintenanceMode: { type: Boolean, default: false },
    supportEmail: { type: String, default: 'support@govsense.ai' },
    allowCitizenRegistration: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// There is only ever one Settings document. Fetch-or-create keeps callers simple.
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ singleton: 'main' });
  if (!settings) settings = await this.create({ singleton: 'main' });
  return settings;
};

export default mongoose.model('Settings', settingsSchema);
