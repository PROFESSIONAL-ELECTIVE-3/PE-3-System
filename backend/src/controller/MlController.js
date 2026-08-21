const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';


const predictRisk = async (req, res, next) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (err) {
    err.statusCode = 502;
    err.message = 'Could not reach the ML service. Is it running?';
    next(err);
  }
};

/**
 * Forwards student feature data to the FastAPI service's GPA forecasting
 * regression model and relays the response back to the client.
 *
 * @route POST /api/ml/gpa-forecast
 * @access Private (professor, administrator)
 */
const predictGpaForecast = async (req, res, next) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict/gpa-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (err) {
    err.statusCode = 502;
    err.message = 'Could not reach the ML service. Is it running?';
    next(err);
  }
};

module.exports = { predictRisk, predictGpaForecast };