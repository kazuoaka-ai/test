const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  level: { type: String, required: true }, 
  reportDate: { type: Date, required: true },
  occurrenceDate: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  
  reporter: {
    loginId: { type: String, required: true },    // 👈 【追加】提出したユーザーのID
    name: { type: String, required: true },
    jobTitle: { type: String, required: true },
    department: { type: String, required: true },
    experienceYears: { type: String, required: true },
    isInvolved: { type: Boolean, default: false }
  },
  
  patient: {
    name: { type: String, default: "" },
    id: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: { type: String, default: "" }
  },
  
  eventCategory: { type: String, required: true },  
  eventSummary: { type: String, required: true },   
  tubeDetails: { type: { type: String, default: "" }, cause: { type: String, default: "" } },
  fallDetails: { triggerAction: { type: String, default: "" }, envFactor: { type: String, default: "" }, adl: { type: String, default: "" }, careLevel: { type: String, default: "" } },
  causes: { environmentalPrimary: { type: String, required: true }, environmentalSecondary: { type: String, default: "" } },
  humanFactors: { primary: { type: String, default: "" }, secondary: { type: String, default: "" } },
  postDiscoveryAction: { type: String, required: true },      
  detailedCauseDescription: { type: String, required: true }, 
  resultStatus: { type: String, required: true },
  countermeasure: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', IncidentSchema);

