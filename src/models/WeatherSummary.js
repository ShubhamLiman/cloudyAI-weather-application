import mongoose from 'mongoose';

const SummarySchema = new mongoose.Schema({
  city: { type: String, required: true, lowercase: true, unique: true },
  summary: { type: String, required: true },
  temp: { type: Number }, // To check if weather has changed significantly
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours
});

export default mongoose.models.WeatherSummary || mongoose.model('WeatherSummary', SummarySchema);