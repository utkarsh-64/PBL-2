from django.db import models
from django.contrib.auth.models import User

class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user_data")
    name = models.CharField(max_length=150, blank=True, null=True)   # was full_name
    dateOfBirth = models.DateField(blank=True, null=True)            # camelCase for frontend
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    MARITAL_CHOICES = [
        ("single", "Single"),
        ("married", "Married"),
        ("divorced", "Divorced"),
        ("widowed", "Widowed"),
    ]
    maritalStatus = models.CharField(max_length=20, choices=MARITAL_CHOICES, blank=True, null=True)
    numberOfDependants = models.PositiveIntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or self.user.username


class IncomeStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="income_status")
    currentSalary = models.DecimalField(max_digits=12, decimal_places=2)
    yearsOfService = models.IntegerField()
    employerType = models.CharField(max_length=100)
    pensionScheme = models.CharField(max_length=100)
    pensionBalance = models.DecimalField(max_digits=15, decimal_places=2)
    employerContribution = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    yourContribution = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    def __str__(self):
        return f"{self.user.username} - {self.employerType} - {self.currentSalary}"


class RetirementInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="retirement_info")
    plannedRetirementAge = models.IntegerField()
    retirementLifestyle = models.CharField(max_length=50)  # minimalistic, comfortable, lavish
    monthlyRetirementExpense = models.DecimalField(max_digits=12, decimal_places=2)
    legacyGoal = models.CharField(max_length=50)  # maximize-income, moderate-legacy, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Retirement Plan for {self.user.username} - Age {self.plannedRetirementAge}"
    
class LifeExpectancy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="life_expectancy")
    
    Height = models.FloatField()
    Weight = models.FloatField()
    Gender = models.CharField(max_length=10, choices=[("Male", "Male"), ("Female", "Female")])
    BMI = models.FloatField()
    Physical_Activity = models.CharField(max_length=50)  # e.g. Sedentary, Moderate, Active
    Smoking_Status = models.CharField(max_length=20)  # Never, Former, Current
    Alcohol_Consumption = models.CharField(max_length=20)  # None, Low, Moderate, High
    Diet = models.CharField(max_length=50)  # e.g. Balanced, Unhealthy, Vegetarian
    Blood_Pressure = models.CharField(max_length=20)  # Normal, High, Low
    Cholesterol = models.IntegerField()
    
    Asthma = models.BooleanField(default=False)
    Diabetes = models.BooleanField(default=False)
    Heart_Disease = models.BooleanField(default=False)
    Hypertension = models.BooleanField(default=False)

    predicted_life_expectancy = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # field to track if user skipped the form
    is_skipped = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Life Expectancy for {self.user.username} - {self.predicted_life_expectancy} years"