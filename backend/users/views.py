import os
import json
import requests
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialApp, SocialAccount, SocialToken
from django.urls import reverse
from urllib.parse import urlencode, quote
from .models import RetirementInfo
from .serializers import RetirementInfoSerializer
# --- NEW IMPORTS FOR INCOME STATUS ---
from .models import IncomeStatus
from .serializers import IncomeStatusSerializer
from rest_framework import status
from .models import UserData
from .serializers import UserDataSerializer, UserRegistrationSerializer, UserLoginSerializer
from .models import LifeExpectancy
from .serializers import LifeExpectancySerializer

from config import SITE_URL, FASTAPI_URL

def get_google_data(user):
    """Get basic data from Google OAuth (no People API calls)"""
    try:
        social_account = SocialAccount.objects.get(user=user, provider='google')
        
        # Only basic data from OAuth - no sensitive information
        basic_data = {
            "google_id": social_account.extra_data.get('sub'),
            "profile_picture": social_account.extra_data.get('picture'),
            "given_name": social_account.extra_data.get('given_name'),
            "family_name": social_account.extra_data.get('family_name'),
        }

        return basic_data

    except:
        return {}


@csrf_exempt
def google_login(request):
    """Directly redirect to Google OAuth without intermediate page"""
    params = {
        "process": "login",
        "next": request.build_absolute_uri(reverse("oauth_callback")),
    }
    google_login_url = f"/accounts/google/login/?{urlencode(params)}"
    return redirect(google_login_url)


@csrf_exempt
def oauth_callback(request):
    """Handle OAuth callback and create JWT token"""
    if not request.user.is_authenticated:
        return redirect(
            f"{SITE_URL}/login?error=auth_failed&reason=user_not_authenticated"
        )

    try:
        refresh = RefreshToken.for_user(request.user)

        # Get Google data
        google_data = get_google_data(request.user)

        user_data = {
            "id": request.user.id,
            "email": request.user.email,
            "name": request.user.get_full_name() or request.user.username,
            **google_data
        }

        # URL encode the user data
        user_json = json.dumps(user_data)
        user_encoded = quote(user_json)

        redirect_url = (
            f"{SITE_URL}/auth/callback?"
            f"token={str(refresh.access_token)}&"
            f"refresh={str(refresh)}&"
            f"user={user_encoded}"
        )
        return redirect(redirect_url)

    except Exception as e:
        return redirect(
            f"{SITE_URL}/login?error=auth_failed&reason=exception&message={str(e)}"
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """Verify JWT token and return user data"""
    user = request.user
    google_data = get_google_data(user)

    return Response(
        {
            "id": user.id,
            "email": user.email,
            "name": user.get_full_name() or user.username,
            **google_data
        }
    )


@api_view(["POST"])
def logout_view(request):
    """Logout user"""
    logout(request)
    return Response({"message": "Logged out successfully"})


# ==========================
# MANUAL AUTH APIs
# ==========================
@api_view(["POST"])
def register_user(request):
    """Manual user registration with email, password, first_name, last_name"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        user_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": user.get_full_name(),
        }
        
        return Response({
            "message": "User registered successfully",
            "user": user_data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login_user(request):
    """Manual user login with email and password"""
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        user_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": user.get_full_name(),
        }
        
        return Response({
            "message": "Login successful",
            "user": user_data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================
# NEW: Income Status APIs
# ==========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_income_status(request):
    """Create or update income status for a user"""
    try:
        # Check if the user already has an income status
        income_status = IncomeStatus.objects.get(user=request.user)
        # If exists, update it
        serializer = IncomeStatusSerializer(income_status, data=request.data, partial=True)
    except IncomeStatus.DoesNotExist:
        # If not exists, create new
        serializer = IncomeStatusSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(
            {"message": "Income status saved/updated!", "data": serializer.data},
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_income_status(request):
    """List all income status records (for all users)"""
    records = IncomeStatus.objects.all()
    serializer = IncomeStatusSerializer(records, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================
# RETIREMENT INFO APIs
# ==========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_retirement_info(request):
    """Create or update retirement info for a user"""
    try:
        # Check if the user already has a retirement info record
        retirement_info = RetirementInfo.objects.get(user=request.user)
        # If exists, update it
        serializer = RetirementInfoSerializer(retirement_info, data=request.data, partial=True)
    except RetirementInfo.DoesNotExist:
        # If not exists, create new
        serializer = RetirementInfoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(
            {"message": "Retirement info saved/updated!", "data": serializer.data},
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_retirement_info(request):
    """List retirement info of the logged-in user"""
    records = RetirementInfo.objects.filter(user=request.user)
    serializer = RetirementInfoSerializer(records, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================
# USER DATA APIs
# ==========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_user_data(request):
    """
    Save or update user personal details
    """
    try:
        # Fetch existing UserData for this user (if any)
        instance = UserData.objects.filter(user=request.user).first()

        # Pass instance for update, or create if not exists
        serializer = UserDataSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"message": "User data saved successfully!", "data": serializer.data},
                status=status.HTTP_201_CREATED if not instance else status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    """
    Get personal details of logged-in user
    """
    try:
        instance = UserData.objects.filter(user=request.user).first()
        if not instance:
            return Response(
                {"message": "No user data found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserDataSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==========================
# LIFE EXPECTANCY APIs
# ==========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_life_expectancy(request):
    """
    Save life expectancy inputs, call FastAPI for prediction,
    store result in DB, and return it to frontend
    """
    try:
        # Step 1: Get data from frontend
        input_data = request.data.copy()

        # Step 2: Call FastAPI service
        fastapi_url = f"{FASTAPI_URL}/life-expectancy"
        response = requests.post(fastapi_url, json=input_data, timeout=10)

        if response.status_code != 200:
            return Response(
                {"error": "Failed to fetch prediction from FastAPI"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        prediction = response.json()
        predicted_value = prediction.get("predicted_life_expectancy")

        if predicted_value is None:
            return Response(
                {"error": "FastAPI did not return prediction"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Step 3: Save/update in LifeExpectancy model
        instance = LifeExpectancy.objects.filter(user=request.user).first()
        input_data["predicted_life_expectancy"] = predicted_value
        input_data["is_skipped"] = False  # Mark as not skipped since user filled the form

        serializer = LifeExpectancySerializer(
            instance, data=input_data, partial=True
        )
        if serializer.is_valid():
            serializer.save(user=request.user)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Step 4: Return prediction to frontend
        return Response(
            {"predicted_life_expectancy": predicted_value},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def skip_life_expectancy(request):
    """
    Handle when user skips life expectancy form - set default value of 72
    """
    try:
        # Check if user already has life expectancy data
        instance = LifeExpectancy.objects.filter(user=request.user).first()
        
        # Create minimal data with default life expectancy
        default_data = {
            'predicted_life_expectancy': 72.00,
            'is_skipped': True  # This will be added to model
        }
        
        if instance:
            # Update existing record
            for key, value in default_data.items():
                setattr(instance, key, value)
            instance.save()
        else:
            # Create new record with minimal required fields
            LifeExpectancy.objects.create(
                user=request.user,
                Height=0,  # Default values for required fields
                Weight=0,
                Gender=request.user.user_data.gender.capitalize() if hasattr(request.user, 'user_data') and request.user.user_data.gender else 'Male',
                BMI=0,
                Physical_Activity='Not Specified',
                Smoking_Status='Not Specified',
                Alcohol_Consumption='Not Specified',
                Diet='Not Specified',
                Blood_Pressure='Not Specified',
                Cholesterol=0,
                predicted_life_expectancy=72.00,
                is_skipped=True
            )
        
        return Response(
            {
                "predicted_life_expectancy": 72.00,
                "message": "Default life expectancy set successfully"
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)