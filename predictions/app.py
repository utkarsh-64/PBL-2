import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from models.life_expectancy import predict_life_expectancy
from models.inflation_prediction import predict_inflation


# Define input schema
class LifeExpectancyInput(BaseModel):
    Height: float
    Weight: float
    Gender: str
    BMI: float
    Physical_Activity: str
    Smoking_Status: str
    Alcohol_Consumption: str
    Diet: str
    Blood_Pressure: str
    Cholesterol: float
    Asthma: int
    Diabetes: int
    Heart_Disease: int
    Hypertension: int


class YearRequest(BaseModel):
    year: int


# Initialize FastAPI
app = FastAPI(title="Life Expectancy Prediction API")


@app.post("/life-expectancy")
def get_life_expectancy(data: LifeExpectancyInput):
    """
    Takes health & lifestyle inputs and returns predicted life expectancy.
    """
    # Convert to DataFrame for model input
    user_data = data.model_dump()

    # Make prediction
    prediction = predict_life_expectancy(user_data)

    return {"predicted_life_expectancy": round(float(prediction), 2)}


@app.post("/predict-inflation")
def get_inflation_data(req: YearRequest):
    future_dates, forecast = predict_inflation(req.year)

    # Build response
    results = pd.DataFrame({"Date": future_dates, "Predicted_Inflation": forecast})
    return results.to_dict(orient="records")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
